import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('Gateway', () => {
	it('can report robots without properties', () => {
		const gameWithOneBlankRobot = simpleGame()
		gameWithOneBlankRobot.gatewayReportDiscoveredRobots({
			[randomMac()]: {},
		})
		expect(Object.values(gameWithOneBlankRobot.robots())).toHaveLength(1)
	})

	test('that robots that are not reported get removed', () => {
		const gameWithChangingRobots = simpleGame()
		const r1 = randomMac()
		const r2 = randomMac()
		gameWithChangingRobots.gatewayReportDiscoveredRobots({
			[r1]: {},
		})
		gameWithChangingRobots.gatewayReportDiscoveredRobots({
			[r2]: {},
		})
		expect(gameWithChangingRobots.robots()).not.toHaveProperty(r1)
		expect(gameWithChangingRobots.robots()).toHaveProperty(r2)
	})

	describe('Gateway should receive a notification when both teams are ready to fight', () => {
		const teamA = 'Team A'
		const teamB = 'Team B'
		const game = simpleGame()
		// Game has two robots
		const robot1 = randomMac()
		const robot2 = randomMac()

		beforeAll(() => {
			// Game has two robots
			game.gatewayReportDiscoveredRobots({
				[robot1]: randomRobot(),
				[robot2]: randomRobot(),
			})
		})

		it.each([[teamA], [teamB]])(
			'should not be possible for team %s to be ready to fight without robots',
			(team) => {
				expect(() => game.teamFight(team)).toThrow()
			},
		)

		it('should notify the Gateway that both teams are ready', () => {
			// Assign robots to teams
			game.adminAssignRobotToTeam(robot1, teamA)
			game.adminAssignRobotToTeam(robot2, teamB)

			const listener = jest.fn()
			game.on(GameEngineEventType.teams_ready_to_fight, listener)
			game.on(GameEngineEventType.robot_movement_set, listener)

			// Team A marks ready to fight
			game.teamFight(teamA)
			expect(listener).not.toHaveBeenCalledWith({
				name: GameEngineEventType.teams_ready_to_fight,
			})
			expect(listener).not.toHaveBeenCalledWith({
				name: GameEngineEventType.robot_movement_set,
			})

			// Team B marks ready to fight, now all teams are ready
			game.teamFight(teamB)

			expect(listener).toHaveBeenCalledWith(
				expect.objectContaining({
					name: GameEngineEventType.robot_movement_set,
				}),
			)
			expect(listener).toHaveBeenCalledWith({
				name: GameEngineEventType.teams_ready_to_fight,
			})
		})

		it('teams should not mark themselves ready to fight multiple times', () => {
			const game = simpleGame()
			const r1 = randomMac()
			game.gatewayReportDiscoveredRobots({
				[r1]: randomRobot(),
			})
			game.adminAssignRobotToTeam(r1, 'Team A')

			game.teamFight('Team A')
			expect(() => game.teamFight('Team A')).toThrow(
				`"Team A" is already ready to fight!`,
			)
		})

		it('should only notify if ALL teams are ready', () => {
			const game = simpleGame()
			const listener = jest.fn()
			game.on(GameEngineEventType.teams_ready_to_fight, listener)
			game.on(GameEngineEventType.robot_movement_set, listener)

			const r1 = randomMac()
			const r2 = randomMac()
			const r3 = randomMac()
			game.gatewayReportDiscoveredRobots({
				[r1]: randomRobot(),
				[r2]: randomRobot(),
				[r3]: randomRobot(),
			})
			game.adminAssignRobotToTeam(r1, 'Team A')
			game.adminAssignRobotToTeam(r2, 'Team B')
			game.adminAssignRobotToTeam(r3, 'Team C')

			game.teamFight('Team A')
			game.teamFight('Team B')
			expect(listener).not.toHaveBeenCalledWith({
				name: GameEngineEventType.robot_movement_set,
			})
			expect(listener).not.toHaveBeenLastCalledWith({
				name: GameEngineEventType.teams_ready_to_fight,
			})

			// Only when all three teams are ready!
			game.teamFight('Team C')
			expect(listener).toHaveBeenCalledWith(
				expect.objectContaining({
					name: GameEngineEventType.robot_movement_set,
				}),
			)
			expect(listener).toHaveBeenLastCalledWith({
				name: GameEngineEventType.teams_ready_to_fight,
			})
		})
	})
})
