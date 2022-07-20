import {
	angleAfterFullRotation,
	degreeConversion,
} from 'utils/degreeConversion.js'

describe('degreeConversion()', () => {
	describe('Should takes a value, which is in 180 format, and allows conversion to 360 format', () => {
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
			const result = degreeConversion(degree)
			expect(result).toBeGreaterThanOrEqual(0)
			expect(result).toBeLessThanOrEqual(360)
		})
	})

	describe('Should not allow to convert values out to the range of [-180 , 180]', () => {
		it.each([[-181], [181], [360], [-360]])('%d', (degree) =>
			expect(() => degreeConversion(degree)).toThrow(
				`Degree is out of range: ${degree}.`,
			),
		)
	})

	describe('Should takes value and return in its equivalent value in 360 format: %d', () => {
		it.each([
			[0, 0],
			[90, 90],
			[180, 180],
			[-180, 180],
			[-90, 270],
			[-0, 0],
		])('%d -> %d', (given, expected) =>
			expect(degreeConversion(given)).toEqual(expected),
		)
	})
})

describe('angleAfterFullRotation()', () => {
	describe('Should takes a value and returns it new position on the circle after rotation if happens', () => {
		it.each([
			[500, 140],
			[-800, -80],
			[90, 90],
			[630, 270],
			[361, 1],
		])('%d -> %d', (given, expected) =>
			expect(angleAfterFullRotation(given)).toEqual(expected),
		)
	})
})
