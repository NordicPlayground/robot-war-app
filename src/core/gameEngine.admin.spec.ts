import { randomMac } from 'core/test/randomMac.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('Admin', () => {
	const game = simpleGame()
	const teamA = 'Brick Crushers!'
	const teamB = '<L@c@ Robot>'

	describe('team assignment', () => {
		it('should not allow blank names', () =>
			expect(() => game.adminAssignRobotToTeam(randomMac(), '')).toThrow(
				/Name cannot be blank!/,
			))
	})

	describe('robot positioning', () => {
		it.each([
			[-2, 0], // all values outside of left border of field
			[-1, 0], // Left outside of field
			[0, -1], // Top outside of field
			[0, 1500], // Right outside of field
			[0, 1501], // Further right outside of field
			[1000, 0], // Bottom outside of field
			[1001, 0], // Further bottom outside of field
		])('cannot place it outside of the field (x: %d, y: %d)', (xMm, yMm) =>
			expect(() =>
				game.adminSetRobotPosition(randomMac(), { xMm, yMm }),
			).toThrow(/Position is outside of field: /),
		)

		it('does not accept floats for positions', () =>
			expect(() =>
				game.adminSetRobotPosition(randomMac(), { xMm: 1.234, yMm: 1.234 }),
			).toThrow(/Invalid position provided: /))

		it.each([360, -1, 720, '1.345'])(
			'should not allow to set invalid rotation values (%s)',
			(rotationDeg) =>
				expect(() =>
					game.adminSetRobotPosition(randomMac(), {
						rotationDeg: rotationDeg as any,
					}),
				).toThrow(/Invalid angle provided: /),
		)
	})

	describe('start next round', () => {
		it('should not be possible to start the next round before the teams are ready to fight', () =>
			expect(() => game.adminNextRound()).toThrow(
				/Round is already in progress!/,
			))
	})

	describe('set the winner', () => {
		it('should not be possible to start the next round after a winner has been picked', () => {
			const robot1 = randomMac()
			const robot2 = randomMac()
			game.adminAssignRobotToTeam(robot1, teamA)
			game.adminAssignRobotToTeam(robot2, teamB)
			game.adminSetWinner(teamA)
			expect(() => game.adminNextRound()).toThrow(/Game is already finished!/)
		})

		it('should not allow to select as a winner a team that was not playing', () => {
			const randomTeam = 'randomTeam'
			expect(() => game.adminSetWinner(randomTeam)).toThrow(
				`Cannot select "${randomTeam}" as a winner because it was not playing.`,
			)
		})

		it('should allow exactly one winner', () =>
			expect(() => game.adminSetWinner(teamB)).toThrow(
				`Cannot select "${teamB}" as a winner because a winner was already selected.`,
			))

		it('should not allow to select the same winner multiple times', () =>
			expect(() => game.adminSetWinner(teamA)).toThrow(
				`Cannot select "${teamA}" as a winner because a winner was already selected.`,
			))
	})
})
