import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const origin = "https://dlang-supplemental.github.io"

async function collectHtml(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true })
  const urls = []
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      urls.push(...(await collectHtml(full, rel)))
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      if (entry.name === "index.html") {
        const dirUrl = prefix ? `${origin}/${prefix}/` : `${origin}/`
        urls.push(dirUrl)
      } else {
        urls.push(`${origin}/${rel.replaceAll("\\", "/")}`)
      }
    }
  }
  return urls
}

const urls = [...new Set(await collectHtml(root))].sort()
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`).join("\n")}
</urlset>
`
await writeFile(path.join(root, "sitemap.xml"), sitemap, "utf8")
await writeFile(
  path.join(root, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  "utf8",
)
console.log(`Wrote robots.txt + sitemap.xml (${urls.length} URLs)`)
