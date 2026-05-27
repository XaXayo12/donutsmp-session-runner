import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const require = createRequire(import.meta.url)

export async function ensureDependencies (config, logger) {
  const runtime = config.runtime || {}
  const required = await dependencyNames(config)
  const missing = missingDependencies(required)

  if (missing.length === 0) return

  if (runtime.autoInstall === false) {
    throw new Error(`missing_dependencies:${missing.join(',')}`)
  }

  await logger.warn('dependencies_missing', { packages: missing })
  await npmInstall(logger)

  const stillMissing = missingDependencies(required)
  if (stillMissing.length > 0) {
    throw new Error(`missing_dependencies_after_install:${stillMissing.join(',')}`)
  }
}

async function dependencyNames (config) {
  const pkg = JSON.parse(await fs.readFile(path.resolve('package.json'), 'utf8'))
  const names = new Set(['mineflayer'])

  for (const [name, enabled] of Object.entries(config.plugins?.external || {})) {
    if (!enabled) continue
    const packageName = externalPackageName(name)
    if (packageName) names.add(packageName)
  }

  for (const name of Object.keys(pkg.dependencies || {})) {
    if (name === 'mineflayer') names.add(name)
  }

  return [...names]
}

function externalPackageName (name) {
  return {
    pathfinder: 'mineflayer-pathfinder',
    autoEat: 'mineflayer-auto-eat',
    armorManager: 'mineflayer-armor-manager',
    tool: 'mineflayer-tool'
  }[name] || null
}

function missingDependencies (packages) {
  return packages.filter(name => !canResolve(name))
}

function canResolve (name) {
  try {
    require.resolve(name, { paths: [process.cwd()] })
    return true
  } catch {
    return false
  }
}

function npmInstall (logger) {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  return new Promise((resolve, reject) => {
    const child = spawn(command, ['install'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
      env: process.env
    })

    child.once('error', error => {
      logger.error('dependencies_install_error', { message: error.message })
      reject(error)
    })

    child.once('exit', code => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`npm_install_failed:${code}`))
    })
  })
}
