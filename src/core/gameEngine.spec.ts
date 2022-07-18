import type { Static } from '@sinclair/typebox'
import type { ReportedGameState } from 'api/validateGameControllerShadow.js'
import { gameEngine, GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

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
		const teamA = 'Brick Crushers!'
		const teamB = '<L@c@ Robot>'

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
					game.assignRobotToTeam(robot1, teamA)
					game.assignRobotToTeam(robot2, teamA)
					game.assignRobotToTeam(robot3, teamB)
					game.assignRobotToTeam(robot4, teamB)
					expect(game.robots()).toMatchObject({
						[robot1]: {
							team: teamA,
						},
						[robot2]: {
							team: teamA,
						},
						[robot3]: {
							team: teamB,
						},
						[robot4]: {
							team: teamB,
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

		describe('User', () => {
			it('should set angle and drivetime for the robot', () => {
				game.setDesiredRobotMovement({
					robotAdress: robot1,
					angleDeg: 90, //The robot is supposed to rotate 90 degrees clockwise
					driveTimeMs: 500, //The robot should drive 500ms
				})
				game.setDesiredRobotMovement({
					robotAdress: robot2,
					angleDeg: 180,
					driveTimeMs: 1000,
				})
				game.setDesiredRobotMovement({
					robotAdress: robot3,
					angleDeg: -90,
					driveTimeMs: 250,
				})
				game.setDesiredRobotMovement({
					robotAdress: robot4,
					angleDeg: -1,
					driveTimeMs: 750,
				})
				// console.log(game.robots())
				expect(game.robots()).toMatchObject({
					[robot1]: {
						angleDeg: 90,
						driveTimeMs: 500,
					},
					[robot2]: { angleDeg: 180, driveTimeMs: 1000 },
					[robot3]: { angleDeg: -90, driveTimeMs: 250 },
					[robot4]: { angleDeg: -1, driveTimeMs: 750 },
				})
			})
			it.each([[1234]])(
				'should not allow invalid robotAdress %s',
				(invalidAddress) => {
					expect(() =>
						game.setDesiredRobotMovement({
							robotAdress: invalidAddress as any,
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
						game.setDesiredRobotMovement({
							driveTimeMs: invalidDriveTimeMs as any,
							robotAdress: robot1,
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
						game.setDesiredRobotMovement({
							angleDeg: invalidAngleDeg as any,
							robotAdress: robot1,
							driveTimeMs: 1000,
						}),
					).toThrow(/invalid angleDeg provided: .+/)
				},
			)

			describe('Starting a round', () => {
				test('that the user can notify the game that they are ready to fight!', () => {
					game.fight(teamA) // First team

					// After a team has marked itself ready to fight, we can read out that they are
					expect(game.teamsReady).toContain(teamA)
					// teamB hasn't yet marked that they are ready to fight
					expect(game.teamsReady).not.toContain(teamB)
				})

				it('should not allow an unknown team to mark ready for fight', () => {
					const randomTeam = 'some other team'

					expect(() => {
						game.fight(randomTeam) // this should not work
					}).toThrow(`Unknown team provided: ${randomTeam}`)

					expect(game.teamsReady).not.toContain(randomTeam)
				})

				test('that teamB can enter the fight', () => {
					game.fight(teamB)
					expect(game.teamsReady).toContain(teamB)
				})

				// rules to test here:
				// - both teams need to be ready, before the fight starts -> Game should notify the gateway only after both teams are ready to fight
			})

			describe('The team should not be able to change the desired robot positions after signalling ready to fight', () => {
				const gameWithOneRobot = simpleGame()
				const teamAsRobot = randomMac()
				const teamA = 'Team A'
				gameWithOneRobot.reportDiscoveredRobots({
					[teamAsRobot]: randomRobot(),
				})
				gameWithOneRobot.assignRobotToTeam(teamAsRobot, teamA)

				it('should not allow setting the position if the robot has not been placed on the field by the admin', () => {
					expect(() =>
						gameWithOneRobot.setDesiredRobotMovement({
							robotAdress: teamAsRobot,
							angleDeg: 135,
							driveTimeMs: 1000,
						}),
					).toThrow(
						`Robot ${teamAsRobot} has not been placed on the field, yet!`,
					)
					// Admin places robot
					gameWithOneRobot.setRobotPosition(teamAsRobot, {
						xMm: 100,
						yMm: 100,
					})
				})

				it('Should allow changes by the team as long as it is not ready to fight', () => {
					const finalRotation = 45
					gameWithOneRobot.setDesiredRobotMovement({
						robotAdress: teamAsRobot,
						angleDeg: 135,
						driveTimeMs: 1000,
					})
					gameWithOneRobot.setDesiredRobotMovement({
						robotAdress: teamAsRobot,
						angleDeg: 90,
						driveTimeMs: 1000,
					})
					gameWithOneRobot.setDesiredRobotMovement({
						robotAdress: teamAsRobot,
						angleDeg: finalRotation,
						driveTimeMs: 1000,
					})
					expect(gameWithOneRobot.robots()).toMatchObject({
						[teamAsRobot]: {
							angleDeg: finalRotation,
							driveTimeMs: 1000,
						},
					})
				})

				test('Should not allow changes by the team after they are ready to fight', () => {
					const beforeFight = 45
					gameWithOneRobot.setDesiredRobotMovement({
						robotAdress: teamAsRobot,
						angleDeg: 135,
						driveTimeMs: 1000,
					})
					gameWithOneRobot.setDesiredRobotMovement({
						robotAdress: teamAsRobot,
						angleDeg: beforeFight,
						driveTimeMs: 1000,
					})
					gameWithOneRobot.fight(teamA)
					expect(() => {
						gameWithOneRobot.setDesiredRobotMovement({
							robotAdress: teamAsRobot,
							angleDeg: 90,
							driveTimeMs: 1000,
						})
					}).toThrow(
						`Cannot move robot after team is ready to fight: ${teamAsRobot}!`,
					)
					expect(gameWithOneRobot.robots()).toMatchObject({
						[teamAsRobot]: {
							angleDeg: beforeFight,
							driveTimeMs: 1000,
						},
					})
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
