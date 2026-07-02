import { NextResponse } from "next/server"

const HEAD_INJECT = `
<base href="https://hanzii.net">
<style>
  /* hide cookie/consent banners */
  [class*="cookie"], [class*="consent"], [class*="gdpr"],
  [id*="cookie"], [id*="consent"],
  .modal-backdrop, .overlay { display: none !important; }
  body { overflow: auto !important; }
</style>
`

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const word = searchParams.get("word") ?? ""

  if (!word || /[^一-鿿㐀-䶿a-zA-Z0-9\s'-]/.test(word)) {
    return new NextResponse("Invalid word", { status: 400 })
  }

  const url = `https://hanzii.net/search/word/${encodeURIComponent(word.trim())}?hl=vi`

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "vi,en;q=0.9",
        Referer: "https://hanzii.net/",
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
