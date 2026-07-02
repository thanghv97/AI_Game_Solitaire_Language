import { NextResponse } from "next/server"

// Simulated OneTrust consent cookies — tells Cambridge the user already accepted
const CONSENT_COOKIES = [
  "OptanonAlertBoxClosed=2024-01-01T00:00:00.000Z",
  "OptanonConsent=isGpcEnabled=0&datestamp=Mon+Jan+01+2024&version=202310.2.0&isIABGlobal=false&hosts=&consentId=bypass&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&geolocation=VN%3A47&AwaitingReconsent=false",
  "oc1=dGVzdA==",
].join("; ")

// Injected into the proxied page to:
// 1. Fix relative URLs via <base>
// 2. Hide the OneTrust consent overlay with CSS
// 3. Auto-click the accept button if it renders anyway
const HEAD_INJECT = `
<base href="https://dictionary.cambridge.org">
<style>
  #onetrust-consent-sdk,
  #onetrust-banner-sdk,
  #onetrust-pc-sdk,
  .onetrust-pc-dark-filter,
  [id^="onetrust"],
  [class^="onetrust"],
  .optanon-alert-box-wrapper,
  .cc-window,
  [class*="cookie-consent"],
  [class*="cookie-banner"],
  [class*="gdpr"] { display: none !important; }
  body { overflow: auto !important; }
</style>
<script>
  (function autoAccept() {
    function tryAccept() {
      var ids = ['onetrust-accept-btn-handler', 'accept-recommended-btn-handler'];
      for (var i = 0; i < ids.length; i++) {
        var btn = document.getElementById(ids[i]);
        if (btn) { btn.click(); return; }
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        tryAccept();
        setTimeout(tryAccept, 800);
      });
    } else {
      tryAccept();
      setTimeout(tryAccept, 800);
    }
  })();
</script>
`

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const word = searchParams.get("word") ?? ""

  if (!word || /[^a-zA-Z0-9\s'-]/.test(word)) {
    return new NextResponse("Invalid word", { status: 400 })
  }

  const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.trim())}`

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: CONSENT_COOKIES,
        Referer: "https://dictionary.cambridge.org/",
      },
      next: { revalidate: 3600 },
    })
    html = await res.text()
  } catch {
    return new NextResponse("Failed to fetch dictionary", { status: 502 })
  }

  html = html.replace(/<head>/i, `<head>${HEAD_INJECT}`)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
