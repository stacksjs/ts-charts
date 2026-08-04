import { describe, expect, it } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface PackageJson {
  name: string
  exports?: Record<string, string | Record<string, string>>
  files?: string[]
  sideEffects?: boolean | string[]
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
      expect(packageJson.sideEffects).toContain('./src/index.ts')
    })
  }

  it('keeps executable exports when Bun bundles a package barrel', async () => {
    const outputDirectory = await mkdtemp(resolve(tmpdir(), 'ts-charts-bun-build-'))

    try {
      const result = await Bun.build({
        entrypoints: [resolve(packagesDirectory, 'format/src/index.ts')],
        outdir: outputDirectory,
        target: 'browser',
        format: 'esm',
        splitting: true,
        minify: true,
      })

      expect(result.success).toBe(true)

      const built = await import(resolve(outputDirectory, 'index.js'))
      expect(built.format('.1f')(42.44)).toBe('42.4')
    }
    finally {
      await rm(outputDirectory, { recursive: true, force: true })
    }
  })
})
