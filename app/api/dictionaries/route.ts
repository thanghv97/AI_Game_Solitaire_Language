import { NextResponse } from "next/server"
import { readdirSync, statSync } from "fs"
import { join } from "path"

export async function GET() {
  const base = join(process.cwd(), "dictionary")
  const result: Record<string, string[]> = {}

  try {
    const langs = readdirSync(base).filter((f) =>
      statSync(join(base, f)).isDirectory()
    )
    for (const lang of langs) {
      const levels = readdirSync(join(base, lang)).filter((f) =>
        statSync(join(base, lang, f)).isDirectory()
      )
      if (levels.length > 0) result[lang] = levels
    }
  } catch {
    // dictionary folder missing or empty
  }

  return NextResponse.json(result)
}
