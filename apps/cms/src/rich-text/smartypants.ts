const OPENING_CONTEXT = /[\s([{—–-]/

export function smartypants(input: string, previous = ' '): string {
	let output = ''
	let last = previous

	for (let index = 0; index < input.length; index++) {
		const char = input[index]!

		if (input.startsWith('---', index)) {
			output += '—'
			last = '—'
			index += 2
			continue
		}
		if (input.startsWith('--', index)) {
			output += '–'
			last = '–'
			index += 1
			continue
		}
		if (input.startsWith('...', index)) {
			output += '…'
			last = '…'
			index += 2
			continue
		}
		if (char === '"') {
			output += OPENING_CONTEXT.test(last) ? '“' : '”'
		} else if (char === "'") {
			output += OPENING_CONTEXT.test(last) ? '‘' : '’'
		} else {
			output += char
		}
		last = char
	}

	return output
}
