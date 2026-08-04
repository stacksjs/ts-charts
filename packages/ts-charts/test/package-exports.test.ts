import { describe, expect, it } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface PackageJson {
  name: string
  exports?: Record<string, string | Record<string, string>>
  files?: string[]
}

const packagesDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

describe('published package exports', () => {
  const manifests = Array.from(new Bun.Glob('*/package.json').scanSync(packagesDirectory))

  for (const manifest of manifests) {
    const manifestPath = resolve(packagesDirectory, manifest)
    const packageDirectory = dirname(manifestPath)
    const packageJson = JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageJson
    const rootExport = packageJson.exports?.['.']

    it(`${packageJson.name} exposes Bun files included in its tarball`, () => {
      expect(typeof rootExport).toBe('object')

      if (typeof rootExport !== 'object' || rootExport === null)
        return

      const bunTarget = rootExport.bun
      expect(bunTarget).toBe('./dist/index.js')
      expect(existsSync(resolve(packageDirectory, bunTarget))).toBe(true)
      expect(packageJson.files).toContain('dist')
    })
  }
})
