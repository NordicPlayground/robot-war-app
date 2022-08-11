import { randomMac } from 'core/test/randomMac.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('User', () => {
	const game = simpleGame()
	describe('should set angle and drivetime for the robot', () => {
		it.each([[1234]])(
			'should not allow invalid robotAdress %s',
			(invalidAddress) => {
				expect(() =>
					game.teamSetRobotMovement(invalidAddress as any, {
						angleDeg: 180,
						driveTimeMs: 1000,
					}),
				).toThrow(/robotAddress not valid: /)
			},
		)

		it.each([
			[-1], // Run 1
			[1450], // Run 2
			[1.2345],
			['Hei'],
		])(
			'must be integer and should not allow drivTimeMs over 1000ms or below 0ms (%s)',
			(invalidDriveTimeMs) => {
				expect(() =>
					game.teamSetRobotMovement(randomMac(), {
						driveTimeMs: invalidDriveTimeMs as any,
						angleDeg: 180,
					}),
				).toThrow(/invalid driveTimeMs provided: /)
			},
		)
		it.each([
			[-190], // Run 1
			[200], // Run 2
			[1.2345],
			['Hei'],
		])(
			'should not allow angles over 180 degrees or below -180 degrees ',
			(invalidAngleDeg) => {
				expect(() =>
					game.teamSetRobotMovement(randomMac(), {
						angleDeg: invalidAngleDeg as any,
						driveTimeMs: 1000,
					}),
				).toThrow(/invalid angleDeg provided: .+/)
			},
		)
	})

	describe('Starting a round', () => {
		it('should not allow an unknown team to mark ready for fight', () => {
			const randomTeam = 'some other team'
			expect(() => {
				game.teamFight(randomTeam) // this should not work
			}).toThrow(`Unknown team provided: ${randomTeam}`)
			expect(game.teamsFinishedConfiguringRobotsMovement()).not.toContain(
				randomTeam,
			)
		})
	})
})
