import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')

const requiredRoots = ['src']
const optionalRoots = ['scripts']
const roots = [...requiredRoots, ...optionalRoots]

let failed = false

for (const root of requiredRoots) {
  const absoluteRoot = path.join(projectRoot, root)

  if (!fs.existsSync(absoluteRoot)) {
    console.error(`Missing required directory: ${root}`)
    failed = true
  }
}

const files = roots
  .flatMap(root => listJavaScriptFiles(path.join(projectRoot, root)))
  .sort()

if (files.length === 0) {
  console.error('No JavaScript files found.')
  process.exit(1)
}

for (const file of files) {
  const relativeFile = path.relative(projectRoot, file)

  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'pipe'
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  if (result.error) {
    console.error(`${relativeFile}: ${result.error.message}`)
    failed = true
    continue
  }

  if (result.signal) {
    console.error(`${relativeFile}: terminated by signal ${result.signal}`)
    failed = true
    continue
  }

  if (result.status !== 0) {
    failed = true
  }
}

if (failed) {
  process.exit(1)
}

console.log(`Checked ${files.length} JavaScript files.`)

function listJavaScriptFiles (root) {
  if (!fs.existsSync(root)) return []

  const output = []

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name)

    if (entry.isDirectory()) {
      output.push(...listJavaScriptFiles(entryPath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      output.push(entryPath)
    }
  }

  return output
}