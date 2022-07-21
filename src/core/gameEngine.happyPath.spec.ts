import type { Static } from '@sinclair/typebox'
import type { ReportedGameState } from 'api/persistence/models/ReportedGameState.js'
import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('Test a full game', () => {
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
			game.gatewayReportDiscoveredRobots(robots)
			expect(game.robots()).toEqual(robots)
		})
	})

	describe('Admin', () => {
		describe('team assignment', () => {
			it('assigns robots to teams', () => {
				game.adminAssignRobotToTeam(robot1, teamA)
				game.adminAssignRobotToTeam(robot2, teamA)
				game.adminAssignRobotToTeam(robot3, teamB)
				game.adminAssignRobotToTeam(robot4, teamB)
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
		})
		describe('robot positioning', () => {
			it('can set the X and Y coordinate', () => {
				game.adminSetRobotPosition(robot1, { xMm: 250, yMm: 100 })
				game.adminSetRobotPosition(robot2, { xMm: 750, yMm: 100 })
				game.adminSetRobotPosition(robot3, { xMm: 250, yMm: 900 })
				game.adminSetRobotPosition(robot4, { xMm: 750, yMm: 900 })
				expect(game.robots()).toMatchObject({
					[robot1]: {
						position: { xMm: 250, yMm: 100 },
					},
					[robot2]: {
						position: { xMm: 750, yMm: 100 },
					},
					[robot3]: {
						position: { xMm: 250, yMm: 900 },
					},
					[robot4]: {
						position: { xMm: 750, yMm: 900 },
					},
				})
			})

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
					game.adminSetRobotPosition(robot1, {
						rotationDeg: 135,
					})
					expect(game.robots()).toMatchObject({
						[robot1]: {
							position: { rotationDeg: 135 },
						},
					})
				})
			})
		})
	})

	describe('User', () => {
		it('should set angle and drivetime for the robot', () => {
			game.teamSetRobotMovement(robot1, {
				angleDeg: 90, //The robot is supposed to rotate 90 degrees clockwise
				driveTimeMs: 500, //The robot should drive 500ms
			})
			game.teamSetRobotMovement(robot2, {
				angleDeg: 180,
				driveTimeMs: 1000,
			})
			game.teamSetRobotMovement(robot3, {
				angleDeg: -90,
				driveTimeMs: 250,
			})
			game.teamSetRobotMovement(robot4, {
				angleDeg: -1,
				driveTimeMs: 750,
			})
			expect(game.robots()).toMatchObject({
				[robot1]: { angleDeg: 90, driveTimeMs: 500 },
				[robot2]: { angleDeg: 180, driveTimeMs: 1000 },
				[robot3]: { angleDeg: -90, driveTimeMs: 250 },
				[robot4]: { angleDeg: -1, driveTimeMs: 750 },
			})
		})

		describe('Starting a round', () => {
			test('that the user can notify the game that they are ready to fight!', () => {
				game.teamFight(teamA) // First team

				// After a team has marked itself ready to fight, we can read out that they are
				expect(game.teamsReady()).toContain(teamA)
				// teamB hasn't yet marked that they are ready to fight
				expect(game.teamsReady()).not.toContain(teamB)
			})

			test('that teamB can enter the fight', () => {
				game.teamFight(teamB)
				expect(game.teamsReady()).toContain(teamB)
			})
		})
	})

	describe('The Gateway moves the robots', () => {
		describe('the Gateway moves the robots and reports back', () => {
			it('should be able to report the status back', () => {
				const listener = jest.fn()
				game.on(GameEngineEventType.robots_discovered, listener)
				game.gatewayReportDiscoveredRobots({
					[robot1]: {
						revolutionCount: 123,
					},
					[robot2]: {
						revolutionCount: 456,
					},
					[robot3]: {
						revolutionCount: 789,
					},
					[robot4]: {
						revolutionCount: 202,
					},
				})
				expect(listener).toHaveBeenCalledWith({
					name: GameEngineEventType.robots_discovered,
				})
				expect(game.robots()).toMatchObject({
					[robot1]: {
						revolutionCount: 123,
					},
					[robot2]: {
						revolutionCount: 456,
					},
					[robot3]: {
						revolutionCount: 789,
					},
					[robot4]: {
						revolutionCount: 202,
					},
				})
			})
		})
	})

	describe('Admin updates positions after the robots have been moved', () => {
		test('The admin updates the positions of the robots on the field', () => {
			expect(() =>
				game.adminSetRobotPosition(robot1, { xMm: 150, yMm: 900 }),
			).not.toThrow()
		})
	})

	describe("Admin starts next round because there isn't a winner yet", () => {
		test("Admin starts the next round and then game should not have a winner and no teams should be 'ready to fight'", () => {
			const listener = jest.fn()
			game.on(GameEngineEventType.next_round, listener)
			game.adminNextRound()
			expect(game.teamsReady()).toEqual([])
			expect(game.winnerTeam).toBeUndefined()
			expect(listener).toHaveBeenCalledWith({
				name: GameEngineEventType.next_round,
			})
		})

		test('that teams can set the desired movement for the next round', () => {
			game.teamSetRobotMovement(robot1, {
				angleDeg: 45,
				driveTimeMs: 675,
			})
			expect(game.robots()).toMatchObject({
				[robot1]: {
					angleDeg: 45,
					driveTimeMs: 675,
				},
			})
		})

		test('that teams can set themselves ready for round 2', () => {
			game.teamFight(teamA)
			game.teamFight(teamB)
			expect(game.teamsReady()).toContain(teamA)
			expect(game.teamsReady()).toContain(teamB)
		})
	})

	describe("The admin picks a winner, because one of the robots is in the opposite team's home zone", () => {
		it('should send a winner notification', () => {
			const listener = jest.fn()
			game.on(GameEngineEventType.winner, listener)
			game.adminSetWinner(teamA)
			expect(listener).toHaveBeenCalledWith({
				name: GameEngineEventType.winner,
				team: teamA,
			})
		})
	})
})
