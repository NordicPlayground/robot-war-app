import { shortId } from 'utils/shortId.js'

describe('shortId()', () => {
	describe('it should reduce the string input to only the three first characters in the string ', () => {
		it.each([
			['15e638e5d725', '15e'],
			['Test', 'Tes'],
			['robotId', 'rob'],
			['He', 'He'],
		])('"%s" -> "%s"', (received, expected) =>
			expect(shortId(received)).toBe(expected),
		)
	})
})
