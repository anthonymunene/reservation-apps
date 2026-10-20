#!/usr/bin/env node
// Checks that the compiled API (lib/src) can run with plain Node.
//
// The TypeScript path aliases (@services/..., @utils/..., @seeds/..., @database-generated-types/...)
// only work under ts-node, which is how dev, the tests and the seeds run. tsc copies them into the
// compiled JavaScript unchanged, and plain Node can't resolve them, so `npm start` would crash the
// first time it loaded a file that used one.
//
// This script starts at every compiled file under lib/src, follows each relative require() into
// the files it loads (including any under lib/seeds), and fails if any of them requires an alias.
// The ESLint rule for src catches direct alias imports; this also catches ones reached indirectly.

const fs = require("fs")
const path = require("path")

const HELP = `Usage: node scripts/check-compiled-imports.js [libDir]

Checks that compiled API code doesn't require TypeScript path aliases, which
plain Node can't resolve. Run it after \`tsc\` (npm run compile does this).

Arguments:
  libDir   Folder tsc compiled into. Default: lib

Exits with status 1 and lists each offending require if any are found.`

const ALIAS = /^@(services|utils|seeds|database-generated-types)\//

const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP)
  process.exit(0)
}

const libDir = path.resolve(args[0] || "lib")
const entryDir = path.join(libDir, "src")
if (!fs.existsSync(entryDir)) {
  console.error(`check-compiled-imports: ${entryDir} not found. Run tsc first.`)
  process.exit(1)
}

const visited = new Set()
const problems = []

// Finds the file a relative require() points at, the way Node would
const resolveRelative = (fromFile, request) => {
  const target = path.resolve(path.dirname(fromFile), request)
  for (const candidate of [target + ".js", path.join(target, "index.js"), target]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }
  return null
}

const visit = file => {
  if (visited.has(file)) return
  visited.add(file)
  const source = fs.readFileSync(file, "utf8")
  for (const match of source.matchAll(/require\("([^"]+)"\)/g)) {
    const request = match[1]
    if (ALIAS.test(request)) {
      problems.push(`${path.relative(process.cwd(), file)} requires "${request}"`)
    } else if (request.startsWith(".")) {
      const target = resolveRelative(file, request)
      if (target) visit(target)
    }
  }
}

const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath)
    else if (fullPath.endsWith(".js")) visit(fullPath)
  }
}

walk(entryDir)

if (problems.length > 0) {
  console.error("Compiled API code requires path aliases that plain Node can't resolve:")
  for (const problem of problems) console.error(`  ${problem}`)
  console.error("Use relative imports in these files (type-only imports are fine).")
  process.exit(1)
}

console.log(`check-compiled-imports: ${visited.size} compiled files checked, no path aliases.`)
