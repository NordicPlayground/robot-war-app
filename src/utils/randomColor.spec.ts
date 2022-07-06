import { randomColor } from 'utils/randomColor.js'

describe('randomColor()', () => {
	const color1 = randomColor()
	const color2 = randomColor()
	it('should return random hex string', () =>
		expect(color1).not.toEqual(color2))
	it('should return a hex', () =>
		expect(/#[a-f0-9]{6}/.test(color1)).toBe(true))
})
