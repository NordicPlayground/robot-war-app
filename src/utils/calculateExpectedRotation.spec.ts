import { calculateExpectedRotation } from 'utils/calculateExpectedRotation.js'

describe('calculateExpectedRotation()', () => {
	it.each([
		[42, 17, 59],
		[0, -180, -180],
		// Overflow
		[180, 10, -170],
	])(
		'should combine the reported angle of a robot %d with the angle %d from the command to equal %d',
		(reportedAngle, commandAngle, expectedAngle) =>
			expect(
				calculateExpectedRotation([
					{
						robotMac: '32-BD-29-6B-BE-11',
						angleDeg: reportedAngle,
						driveTimeMs: 0,
					},
					{
						robotMac: '32-BD-29-6B-BE-11',
						angleDeg: commandAngle,
						driveTimeMs: 0,
					},
				]),
			).toEqual(expectedAngle),
	)
})
