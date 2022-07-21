import { gameEngine, GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
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
			[1500, 0], // Right outside of field
			[1501, 0], // Further right outside of field
			[0, 1000], // Bottom outside of field
			[0, 1001], // Further bottom outside of field
		])('cannot place it outside of the field (x: %d, y: %d)', (xMm, yMm) =>
			expect(() => {
				const game = gameEngine({
					field: {
						widthMm: 1500,
						heightMm: 1000,
					},
				})
				game.adminSetRobotPosition(randomMac(), { xMm, yMm })
			}).toThrow(/Position is outside of field: /),
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

	describe('load a game that was already in progress', () => {
		it('should allow to provide existing robot positions', () => {
			const listener = jest.fn()
			const gameInProgress = simpleGame()
			gameInProgress.on(GameEngineEventType.robot_positions_set, listener)
			const robot1 = randomMac()
			const robot2 = randomMac()
			const robot3 = randomMac()
			const robot4 = randomMac()
			gameInProgress.gatewayReportDiscoveredRobots({
				[robot1]: randomRobot(),
				[robot2]: randomRobot(),
				[robot3]: randomRobot(),
				[robot4]: randomRobot(),
			})
			gameInProgress.adminSetAllRobotPositions({
				[robot1]: {
					xMm: 250,
					yMm: 100,
					rotationDeg: 123,
				},
				[robot2]: {
					xMm: 750,
					yMm: 100,
					rotationDeg: 236,
				},
				[robot3]: {
					xMm: 250,
					yMm: 900,
					rotationDeg: 17,
				},
				[robot4]: {
					xMm: 750,
					yMm: 900,
					rotationDeg: 42,
				},
			})
			expect(gameInProgress.robots()).toMatchObject({
				[robot1]: {
					position: { xMm: 250, yMm: 100, rotationDeg: 123 },
				},
				[robot2]: {
					position: { xMm: 750, yMm: 100, rotationDeg: 236 },
				},
				[robot3]: {
					position: { xMm: 250, yMm: 900, rotationDeg: 17 },
				},
				[robot4]: {
					position: { xMm: 750, yMm: 900, rotationDeg: 42 },
				},
			})
			expect(listener).toHaveBeenCalledWith({
				name: GameEngineEventType.robot_positions_set,
			})
		})

		test('Regression: Position is outside of field: 1158/131! (Field is 1500/1000.)', () => {
			const game = gameEngine({
				field: {
					heightMm: 1000,
					widthMm: 1500,
				},
			})
			const robot = randomMac()
			game.gatewayReportDiscoveredRobots({ [robot]: randomRobot() })
			game.adminSetAllRobotPositions({
				[robot]: {
					xMm: 1158,
					yMm: 131,
					rotationDeg: 0,
				},
			})
		})
	})
})
