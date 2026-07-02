import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; level: string }> }
) {
  const { lang, level } = await params

  // Prevent path traversal
  if (/[^a-zA-Z0-9_-]/.test(lang) || /[^a-zA-Z0-9_-]/.test(level)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  const filePath = join(process.cwd(), "dictionary", lang, level, "dictionary.json")

  try {
    const content = readFileSync(filePath, "utf-8")
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
