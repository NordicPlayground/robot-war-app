import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('The team should not be able to change the desired robot positions after signalling ready to fight', () => {
	describe('teamSetRobotMovement()', () => {
		const gameWithOneRobot = simpleGame()
		const teamAsRobot = randomMac()
		const teamA = 'Team A'
		gameWithOneRobot.gatewayReportDiscoveredRobots({
			[teamAsRobot]: randomRobot(),
		})
		gameWithOneRobot.adminAssignRobotToTeam(teamAsRobot, teamA)

		it('should not allow setting the position if the robot has not been placed on the field by the admin', () => {
			expect(() =>
				gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
					angleDeg: 135,
					driveTimeMs: 1000,
				}),
			).toThrow(`Robot ${teamAsRobot} has not been placed on the field, yet!`)
			// Admin places robot
			gameWithOneRobot.adminSetRobotPosition(teamAsRobot, {
				xMm: 100,
				yMm: 100,
			})
		})

		it('Should allow changes by the team as long as it is not ready to fight', () => {
			const finalRotation = 45
			gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
				angleDeg: 135,
				driveTimeMs: 1000,
			})
			gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
				angleDeg: 90,
				driveTimeMs: 1000,
			})
			gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
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
			gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
				angleDeg: 135,
				driveTimeMs: 1000,
			})
			gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
				angleDeg: beforeFight,
				driveTimeMs: 1000,
			})
			gameWithOneRobot.teamFight(teamA)
			expect(() => {
				gameWithOneRobot.teamSetRobotMovement(teamAsRobot, {
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

		test('that an event is emitted when fight is confirmed by all teams', () => {
			const listener = jest.fn()
			const game = simpleGame()
			const robot1 = randomMac()
			game.gatewayReportDiscoveredRobots({
				[robot1]: {},
			})
			game.adminAssignRobotToTeam(robot1, 'Team A')
			game.adminSetRobotPosition(robot1, {
				xMm: 17,
				yMm: 42,
				rotationDeg: 0,
			})

			game.on(GameEngineEventType.robot_movement_set, listener)

			game.teamSetRobotMovement(robot1, {
				angleDeg: 90,
				driveTimeMs: 500,
			})

			game.teamFight('Team A')

			expect(game.robots()).toMatchObject({
				[robot1]: { angleDeg: 90, driveTimeMs: 500 },
			})

			expect(listener).toHaveBeenCalled()
		})
	})

	describe('teamSetRobotsMovement()', () => {
		test('that the robot desired movements can be set all at once', () => {
			const listener = jest.fn()
			const game = simpleGame()
			const robot1 = randomMac()
			const robot2 = randomMac()
			game.gatewayReportDiscoveredRobots({
				[robot1]: {},
				[robot2]: {},
			})
			game.adminAssignRobotToTeam(robot1, 'Team A')
			game.adminAssignRobotToTeam(robot2, 'Team A')
			game.adminSetAllRobotPositions({
				[robot1]: {
					xMm: 17,
					yMm: 42,
					rotationDeg: 0,
				},
				[robot2]: {
					xMm: 42,
					yMm: 17,
					rotationDeg: 0,
				},
			})

			game.on(GameEngineEventType.robot_movements_set, listener)

			game.teamSetAllRobotMovements({
				[robot1]: { angleDeg: 90, driveTimeMs: 500 },
				[robot2]: { angleDeg: 180, driveTimeMs: 1000 },
			})

			expect(game.robots()).toMatchObject({
				[robot1]: { angleDeg: 90, driveTimeMs: 500 },
				[robot2]: { angleDeg: 180, driveTimeMs: 1000 },
			})

			expect(listener).toHaveBeenCalled()
		})
	})

	describe('teams()', () => {
		it('should return a blank list of teams on a new game', () =>
			expect(simpleGame().teams()).toEqual([]))
		describe('should return the name of the teams that have been assigned robots', () => {
			test('one team, two robots', () => {
				const gameWithOneTeam = simpleGame()
				gameWithOneTeam.adminAssignRobotToTeam(randomMac(), 'Bot Busters')
				gameWithOneTeam.adminAssignRobotToTeam(randomMac(), 'Bot Busters')
				expect(gameWithOneTeam.teams()).toEqual(['Bot Busters'])
			})
			test('two teams, one robot each', () => {
				const gameWithTwoTeams = simpleGame()
				gameWithTwoTeams.adminAssignRobotToTeam(randomMac(), 'Bot Busters')
				gameWithTwoTeams.adminAssignRobotToTeam(randomMac(), 'Gear Grinders')
				expect(gameWithTwoTeams.teams()).toEqual([
					'Bot Busters',
					'Gear Grinders',
				])
			})
		})
	})
})
