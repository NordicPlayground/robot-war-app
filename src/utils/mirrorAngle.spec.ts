import { mirrorAngle } from 'utils/mirrorAngle.js'

describe('mirrorAngle', () => {
	it.each([
		[0, 180],
		[180, 0],
		[90, -90],
		[-90, 90],
		[45, -135],
	])('should mirror angle %d to %d', (angle, mirrored) =>
		expect(mirrorAngle(angle)).toEqual(mirrored),
	)
})
