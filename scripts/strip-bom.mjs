#!/usr/bin/env node
/**
 * Strips a leading UTF-8 BOM (EF BB BF) from the files given as arguments.
 *
 * .editorconfig declares `charset = utf-8`, not utf-8-bom, but nothing enforced it: Prettier
 * preserves a BOM, and Windows tooling (PowerShell's Out-File / Set-Content) writes one by
 * default. The result was a phantom byte at file head that makes git report line 1 changed
 * whenever any tool normalises it: diff noise unrelated to the actual edit.
 *
 * This runs from lint-staged, so it FIXES rather than fails: a BOM written by any tool is
 * removed before the file is committed.
 */
import { readFile, writeFile } from 'node:fs/promises'

const BOM = '﻿'

await Promise.all(
	process.argv.slice(2).map(async file => {
		const content = await readFile(file, 'utf8')
		if (!content.startsWith(BOM)) return
		await writeFile(file, content.slice(BOM.length), 'utf8')
		console.log(`stripped BOM: ${file}`)
	})
)
