const EM_DASH = String.fromCharCode(0x2014)
const EN_DASH = String.fromCharCode(0x2013)
const OPENING_CONTEXT = new RegExp(`[\\s([{${EM_DASH}${EN_DASH}-]`)

export function smartypants(input: string, previous = ' '): string {
	let output = ''
	let last = previous

	for (let index = 0; index < input.length; index++) {
		const char = input[index]!

		if (input.startsWith('---', index)) {
			output += EM_DASH
			last = EM_DASH
			index += 2
			continue
		}
		if (input.startsWith('--', index)) {
			output += EN_DASH
			last = EN_DASH
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
