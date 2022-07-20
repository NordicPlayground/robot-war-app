import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('gameEngine notifications', () => {
	const game = simpleGame()
	const listener = jest.fn()

	describe('onAll', () => {
		it('should notify subscribers of changes', () => {
			game.onAll(listener)
			game.gatewayReportDiscoveredRobots({
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
			game.gatewayReportDiscoveredRobots({
				[randomMac()]: randomRobot(),
			})
			expect(listener).toHaveBeenCalledTimes(1)
		})
	})

	describe('admin notifications', () => {
		const game = simpleGame()

		const address = randomMac()
		game.gatewayReportDiscoveredRobots({
			[address]: randomRobot(),
		})

		it('should emit an event when the robot is assigned to a team', () => {
			const listener = jest.fn()
			game.onAll(listener)

			// Admin assigns team
			game.adminAssignRobotToTeam(address, 'Team A')

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
			game.adminSetRobotPosition(address, {
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
			game.adminSetRobotPosition(address, {
				rotationDeg: 135,
			})

			expect(listener).toHaveBeenCalledWith({
				name: GameEngineEventType.robot_position_set,
				address,
				position: {
					rotationDeg: 135,
				},
			})
		})
	})

	describe('on', () => {
		it('should notify about a specific event', () => {
			const game = simpleGame()

			const typedListener = jest.fn()
			game.on(GameEngineEventType.robots_discovered, typedListener)

			const robot = randomMac()

			game.gatewayReportDiscoveredRobots({
				[robot]: randomRobot(),
			})

			game.adminSetRobotPosition(robot, {
				xMm: 123,
				yMm: 567,
			})

			expect(typedListener).toHaveBeenCalledTimes(1)
			expect(typedListener).toHaveBeenCalledWith({
				name: GameEngineEventType.robots_discovered,
			})
		})
	})

	describe('off', () => {
		it('should not call a listener for a specific event it it has been disabled', () => {
			const game = simpleGame()

			const typedListener = jest.fn()
			game.on(GameEngineEventType.robots_discovered, typedListener)

			const robot = randomMac()

			game.gatewayReportDiscoveredRobots({
				[robot]: randomRobot(),
			})

			expect(typedListener).toHaveBeenCalledTimes(1)

			game.off(GameEngineEventType.robots_discovered, typedListener)

			game.gatewayReportDiscoveredRobots({
				[robot]: randomRobot(),
			})

			expect(typedListener).toHaveBeenCalledTimes(1)
		})
	})
})
