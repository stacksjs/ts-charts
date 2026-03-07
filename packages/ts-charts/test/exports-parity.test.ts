import { expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as tsCharts from '../src/index.ts'

interface PackageJson {
  dependencies?: Record<string, string>
}

const packagePath = resolve(dirname(fileURLToPath(import.meta.url)), '../package.json')
const packageData = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageJson

for (const moduleName of Object.keys(packageData.dependencies ?? {})) {
  it(`ts-charts exports everything from ${moduleName}`, async () => {
    const module = await import(moduleName)

    for (const propertyName of Object.keys(module)) {
      if (propertyName !== 'version') {
        expect(propertyName in tsCharts).toBe(true)
      }
    }
  })
}
