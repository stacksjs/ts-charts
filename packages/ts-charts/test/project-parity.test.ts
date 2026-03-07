import { expect, it } from 'bun:test'
import { readdir, stat } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface RootPackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const rootPackagePath = resolve(projectRoot, 'package.json')
const packagesRoot = resolve(projectRoot, 'packages')

it('workspace uses very-happy-dom and does not depend on happy-dom', async () => {
  const rootPackage = (await import(rootPackagePath, { with: { type: 'json' } })).default as RootPackageJson

  const allDeps = {
    ...(rootPackage.dependencies ?? {}),
    ...(rootPackage.devDependencies ?? {}),
  }

  expect(allDeps['very-happy-dom']).toBeDefined()
  expect(allDeps['happy-dom']).toBeUndefined()
})

it('packages directory is fully TypeScript (no .js/.cjs/.mjs files outside dist)', async () => {
  const nonTypeScriptFiles = await findNonTypeScriptSourceFiles(packagesRoot)
  expect(nonTypeScriptFiles).toEqual([])
})

async function findNonTypeScriptSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory)
  const files: string[] = []

  for (const entry of entries) {
    if (entry === 'dist' || entry === 'node_modules' || entry.startsWith('.')) continue

    const absolutePath = resolve(directory, entry)
    const entryStat = await stat(absolutePath)

    if (entryStat.isDirectory()) {
      files.push(...await findNonTypeScriptSourceFiles(absolutePath))
      continue
    }

    if (/\.(js|cjs|mjs)$/.test(entry)) {
      files.push(relative(projectRoot, absolutePath))
    }
  }

  return files
}
