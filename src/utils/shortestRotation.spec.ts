import { shortestRotation } from 'utils/shortestRotation.js'

describe('shortestRotation()', () => {
	describe('should normalize rotations so the robot uses the shortes rotation to reach the destination rotation', () => {
		it.each([
			[0, 0],
			[10, 10],
			[180, 180],
			[-10, -10],
			[-180, -180],
			[190, -170],
			[-190, 170],
			[360, 0],
			[360 * 2, 0],
			[361, 1],
		])('%d -> %d', (targetAngle, expectedAngle) =>
			expect(shortestRotation(targetAngle)).toEqual(expectedAngle),
		)
	})
})
