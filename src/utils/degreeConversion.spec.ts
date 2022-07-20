import {
	angleAfterFullRotation,
	convertToPositiveAngle,
} from 'utils/degreeConversion.js'

describe('angleAfterFullRotation()', () => {
	describe('Should takes a value and returns it new position after rotation if happens', () => {
		it.each([
			[500, 140],
			[-800, -80],
			[90, 90],
			[630, 270],
			[361, 1],
			[-990, -270],
		])('%d -> %d', (given, expected) =>
			expect(angleAfterFullRotation(given)).toEqual(expected),
		)
	})
})

describe('convertToPositiveAngle()', () => {
	describe('Should return expected values', () => {
		it.each([
			[0, 0],
			[90, 90],
			[180, 180],
			[360, 0],
			[-0, 0],
			[-90, 270],
			[-180, 180],
			[-270, 90],
			[-360, 0],
		])('%d -> %d', (given, expected) =>
			expect(convertToPositiveAngle(given)).toEqual(expected),
		)
	})

	describe('Should return positive angles between [0,360]', () => {
		it.each([
			[0],
			[37],
			[45],
			[54],
			[90],
			[100],
			[161],
			[180],
			[-180],
			[-145],
			[-100],
			[-90],
			[-78],
			[-45],
			[-22],
			[-15],
			[-0],
		])('%d', (degree) => {
			const result = convertToPositiveAngle(degree)
			expect(result).toBeGreaterThanOrEqual(0)
			expect(result).toBeLessThanOrEqual(360)
		})
	})

	describe('Should not allow to convert values out to the range of [-360 , 360]', () => {
		it.each([[-361], [361], [720], [-720]])('%d', (degree) =>
			expect(() => convertToPositiveAngle(degree)).toThrow(
				`Degree is out of range: ${degree}.`,
			),
		)
	})
})
