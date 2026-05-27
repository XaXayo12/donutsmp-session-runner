import fs from 'node:fs/promises'
import path from 'node:path'

export async function readJson (file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

export async function readJsonIfExists (file) {
  try {
    return await readJson(file)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

export async function listJsonFiles (root, options) {
  const files = []
  await walk(path.resolve(root), files, options, 0)
  return files
}

async function walk (dir, files, options, depth) {
  if (files.length >= options.maxFiles) return

  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }

  for (const entry of entries) {
    if (files.length >= options.maxFiles) return

    const file = path.join(dir, entry.name)

    if (entry.isDirectory() && options.recursive && depth < 4) {
      await walk(file, files, options, depth + 1)
      continue
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(file)
    }
  }
}
