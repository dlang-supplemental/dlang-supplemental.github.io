import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const candidates = [
  process.env.DIAGRAM_SRC,
  path.resolve(root, "..", "docs", "docs", "modules", "ROOT", "images"),
].filter(Boolean)
const sourceDir = candidates.find(existsSync)
if (!sourceDir) throw new Error(`Canonical dlang-supplemental/docs images not found:\n${candidates.join("\n")}`)

const names = [
  "tgc-actors",
  "tgc-desktop-mock",
  "tgc-many-to-many-regions",
  "tgc-opt-in-mock",
  "tgc-performance-compare",
  "tgc-stw-timeline",
]
const outputDir = path.join(root, "images")
const check = process.argv.includes("--check")
let stale = false
mkdirSync(outputDir, { recursive: true })

for (const name of names) {
  for (const suffix of [".svg", ".host.svg"]) {
    const source = path.join(sourceDir, `${name}${suffix}`)
    const target = path.join(outputDir, `${name}${suffix}`)
    if (!existsSync(source)) throw new Error(`Missing canonical artifact ${source}`)
    if (check) {
      if (!existsSync(target) || readFileSync(source, "utf8") !== readFileSync(target, "utf8")) {
        console.error(`stale ${path.relative(root, target)}`)
        stale = true
      }
    } else {
      copyFileSync(source, target)
      console.log(`copied ${path.relative(root, target)}`)
    }
  }
}

if (stale) process.exitCode = 3
