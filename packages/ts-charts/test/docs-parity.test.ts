import { expect, it } from 'bun:test'
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const docsRoot = resolve(projectRoot, 'docs')

it('documentation links point to existing internal anchors', async () => {
  if (!await directoryExists(docsRoot)) return

  const anchors = new Map<string, string[]>()
  const links: Array<{ source: string, target: string, hash: string }> = []

  for await (const file of readMarkdownFiles(docsRoot)) {
    const text = await readMarkdownSource(`${docsRoot}${file}`)
    anchors.set(file, getAnchors(text))

    for (const { pathname, hash } of getLinks(file, text)) {
      links.push({ source: file, target: pathname, hash })
    }
  }

  const errors: string[] = []

  for (const { source, target, hash } of links) {
    let normalizedTarget = target

    if (!normalizedTarget.endsWith('.md')) {
      errors.push(`- ${source} points to ${target} instead of ${target}.md.`)
      normalizedTarget += '.md'
    }

    if (anchors.get(normalizedTarget)?.includes(hash.slice(1))) continue

    errors.push(`- ${source} points to missing ${normalizedTarget}${hash}.`)
  }

  expect(errors).toEqual([])
})

function getAnchors(text: string): string[] {
  const anchors = ['']

  for (const [, header] of text.matchAll(/^#+ ([*\w][*().,\w\d -]+)\n/gm)) {
    anchors.push(
      header
        .replaceAll(/[^\w\d\s]+/g, ' ')
        .trim()
        .replaceAll(/ +/g, '-')
        .toLowerCase(),
    )
  }

  for (const [, anchor] of text.matchAll(/ \{#([\w\d-]+)\}/g)) {
    anchors.push(anchor)
  }

  return anchors
}

function getLinks(file: string, text: string): Array<{ pathname: string, hash: string }> {
  const links: Array<{ pathname: string, hash: string }> = []

  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const [, link] = match

    if (/^\w+:/.test(link)) continue

    const { pathname, hash } = new URL(link, new URL(file, 'https://example.com/'))
    links.push({ pathname, hash })
  }

  return links
}

async function readMarkdownSource(filePath: string): Promise<string> {
  return (await readFile(filePath, 'utf8')).replaceAll(/<!-- .*? -->/gs, '')
}

async function* readMarkdownFiles(root: string, subpath = '/'): AsyncGenerator<string> {
  for (const fname of await readdir(`${root}${subpath}`)) {
    if (fname.startsWith('.')) continue

    const filePath = `${root}${subpath}${fname}`
    if ((await stat(filePath)).isDirectory()) {
      yield* readMarkdownFiles(root, `${subpath}${fname}/`)
    }
    else if (fname.endsWith('.md')) {
      yield `${subpath}${fname}`
    }
  }
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  }
  catch {
    return false
  }
}
