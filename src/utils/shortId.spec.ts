import { shortId } from 'utils/shortId.js'

describe('shortId()', () => {
	describe('it should reduce the string input to only the three first characters in the string ', () => {
		it.each([
			['Example', 'Exa'],
			['Test', 'Tes'],
			['robotId', 'rob'],
			['Hello', 'Hel'],
		])('"%s" -> "%s"', (received, expected) =>
			expect(shortId(received)).toBe(expected),
		)
	})
})
