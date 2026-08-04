import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const sourceFiles = Array.from(new Bun.Glob('**/*.ts').scanSync('src')).map(file => resolve('src', file))

if (sourceFiles.length === 0)
  throw new Error(`No TypeScript sources found in ${process.cwd()}/src`)

rmSync('dist', { recursive: true, force: true })

const build = Bun.spawn([
  'bunx',
  'tsc',
  '--ignoreConfig',
  '--target',
  'ESNext',
  '--module',
  'ESNext',
  '--moduleResolution',
  'bundler',
  '--rewriteRelativeImportExtensions',
  'true',
  '--declaration',
  '--skipLibCheck',
  '--noCheck',
  '--rootDir',
  'src',
  '--outDir',
  'dist',
  ...sourceFiles,
], {
  cwd: process.cwd(),
  stdout: 'inherit',
  stderr: 'inherit',
})

const exitCode = await build.exited
if (exitCode !== 0)
  throw new Error(`TypeScript package build failed with exit code ${exitCode}`)
