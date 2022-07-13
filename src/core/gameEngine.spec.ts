import type { Static } from '@sinclair/typebox'
import type { ReportedGameState } from 'api/validateGameControllerShadow.js'
import { gameEngine, GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'

const simpleGame = () =>
	gameEngine({
		field: {
			heightMm: 1000,
			widthMm: 1500,
		},
	})

describe('gameEngine', () => {
	it('can instantiate a new game with field dimensions', () => {
		const game = gameEngine({
			field: {
				heightMm: 1000,
				widthMm: 1500,
			},
		})
		expect(game).not.toBeUndefined()
		expect(game.field).toEqual({
			widthMm: 1500,
			heightMm: 1000,
		})
	})

	test('that initially there are no robots', () =>
		expect(simpleGame().robots()).toEqual({}))

	describe('Game preparation', () => {
		const robot1 = randomMac()
		const robot2 = randomMac()
		const robot3 = randomMac()
		const robot4 = randomMac()
		const game = simpleGame()

		describe('Gateway', () => {
			it('reports the robots it sees', () => {
				const robots: Static<typeof ReportedGameState>['robots'] = {
					[robot1]: randomRobot(),
					[robot2]: randomRobot(),
					[robot3]: randomRobot(),
					[robot4]: randomRobot(),
				}
				game.reportDiscoveredRobots(robots)
				expect(game.robots()).toEqual(robots)
			})
		})

		describe('Admin', () => {
			describe('team assignment', () => {
				it('assigns robots to teams', () => {
					game.assignRobotToTeam(robot1, 'Brick Crushers!')
					game.assignRobotToTeam(robot2, 'Brick Crushers!')
					game.assignRobotToTeam(robot3, '<L@c@ Robot>')
					game.assignRobotToTeam(robot4, '<L@c@ Robot>')
					expect(game.robots()).toMatchObject({
						[robot1]: {
							team: 'Brick Crushers!',
						},
						[robot2]: {
							team: 'Brick Crushers!',
						},
						[robot3]: {
							team: '<L@c@ Robot>',
						},
						[robot4]: {
							team: '<L@c@ Robot>',
						},
					})
				})
				it('should not allow blank names', () =>
					expect(() => game.assignRobotToTeam(robot1, '')).toThrow(
						/Name cannot be blank!/,
					))
			})
			describe('robot positioning', () => {
				it('can set the X and Y coordinate', () => {
					game.setRobotPosition(robot1, { xMm: 250, yMm: 100 })
					game.setRobotPosition(robot2, { xMm: 750, yMm: 100 })
					game.setRobotPosition(robot3, { xMm: 250, yMm: 1400 })
					game.setRobotPosition(robot4, { xMm: 750, yMm: 1400 })
					expect(game.robots()).toMatchObject({
						[robot1]: {
							position: { xMm: 250, yMm: 100 },
						},
						[robot2]: {
							position: { xMm: 750, yMm: 100 },
						},
						[robot3]: {
							position: { xMm: 250, yMm: 1400 },
						},
						[robot4]: {
							position: { xMm: 750, yMm: 1400 },
						},
					})
				})

				it.each([
					[-2, 0], // all values outside of left border of field
					[-1, 0], // Left outside of field
					[0, -1], // Top outside of field
					[0, 1500], // Right outside of field
					[0, 1501], // Further right outside of field
					[1000, 0], // Bottom outside of field
					[1001, 0], // Further bottom outside of field
				])('cannot place it outside of the field (x: %d, y: %d)', (xMm, yMm) =>
					expect(() => game.setRobotPosition(robot1, { xMm, yMm })).toThrow(
						/Position is outside of field: /,
					),
				)

				it('does not accept floats for positions', () =>
					expect(() =>
						game.setRobotPosition(robot1, { xMm: 1.234, yMm: 1.234 }),
					).toThrow(/Invalid position provided: /))

				describe('robot rotations', () => {
					it('should give robots a default rotation based on their position', () => {
						expect(game.robots()).toMatchObject({
							[robot1]: {
								position: { rotationDeg: 90 }, // Facing right
							},
							[robot2]: {
								position: { rotationDeg: 90 }, // Facing right
							},
							[robot3]: {
								position: { rotationDeg: 270 }, // Facing left
							},
							[robot4]: {
								position: { rotationDeg: 270 }, // Facing left
							},
						})
					})

					it('should be able to update the rotation', () => {
						game.setRobotRotation(robot1, 135)
						expect(game.robots()).toMatchObject({
							[robot1]: {
								position: { rotationDeg: 135 },
							},
						})
					})

					it.each([360, -1, 720, '1.345'])(
						'should not allow to set invalid rotation values (%s)',
						(rotationDeg) =>
							expect(() =>
								game.setRobotRotation(robot1, rotationDeg as any),
							).toThrow(/Invalid angle provided: /),
					)
				})
			})
		})
	})

	describe('notifications', () => {
		const game = simpleGame()
		const listener = jest.fn()

		describe('onAll', () => {
			it('should notify subscribers of changes', () => {
				game.onAll(listener)
				game.reportDiscoveredRobots({
					[randomMac()]: randomRobot(),
				})
				expect(listener).toHaveBeenCalledWith({
					name: GameEngineEventType.robots_discovered,
				})
			})
		})

		describe('ofAll', () => {
			it('should unregister subscribers', () => {
				expect(listener).toHaveBeenCalledTimes(1)
				game.offAll(listener)
				game.reportDiscoveredRobots({
					[randomMac()]: randomRobot(),
				})
				expect(listener).toHaveBeenCalledTimes(1)
			})
		})

		describe('admin notifications', () => {
			const game = simpleGame()

			const address = randomMac()
			game.reportDiscoveredRobots({
				[address]: randomRobot(),
			})

			it('should emit an event when the robot is assigned to a team', () => {
				const listener = jest.fn()
				game.onAll(listener)

				// Admin assigns team
				game.assignRobotToTeam(address, 'Team A')

				expect(listener).toHaveBeenCalledWith({
					name: GameEngineEventType.robot_team_assigned,
					address,
					team: 'Team A',
				})
			})

			it('should emit an event when the robot position is changed', () => {
				const listener = jest.fn()
				game.onAll(listener)

				// Admin assigns a position
				game.setRobotPosition(address, {
					xMm: 17,
					yMm: 42,
				})

				expect(listener).toHaveBeenCalledWith({
					name: GameEngineEventType.robot_position_set,
					address,
					position: {
						xMm: 17,
						yMm: 42,
					},
				})
			})

			it('should emit an event when the robot rotation is changed', () => {
				const listener = jest.fn()
				game.onAll(listener)

				// Admin assigns a position
				game.setRobotRotation(address, 135)

				expect(listener).toHaveBeenCalledWith({
					name: GameEngineEventType.robot_rotation_set,
					address,
					position: {
						rotationDeg: 135,
					},
				})
			})
		})
	})
})
