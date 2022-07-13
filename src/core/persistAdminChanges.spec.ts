import { persistAdminChanges } from 'core/persistAdminChanges.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('persistAdminChanges', () => {
	it('should store changes done to robots by the admin in the shadow of the game controller thing', async () => {
		const game = simpleGame()
		const address = randomMac()
		game.reportDiscoveredRobots({
			[address]: randomRobot(),
		})

		// Register persistence handler
		const persist = jest.fn(async () => Promise.resolve())
		await persistAdminChanges({
			game,
			persist,
		})

		// When the admin assigns a robot to a team
		game.assignRobotToTeam(address, 'Team A')

		// Then the shadow of the game controller thing should be updated
		expect(persist).toHaveBeenLastCalledWith({
			robotTeamAssignment: {
				[address]: 'Team A',
			},
		})

		// When the admin sets the position of a robot
		game.setRobotPosition(address, {
			xMm: 17,
			yMm: 42,
		})
		expect(persist).toHaveBeenLastCalledWith({
			robotFieldPosition: {
				[address]: {
					xMm: 17,
					yMm: 42,
				},
			},
		})

		// When the admin sets the rotation of a robot
		game.setRobotRotation(address, 42)
		expect(persist).toHaveBeenLastCalledWith({
			robotFieldPosition: {
				[address]: {
					rotationDeg: 42,
				},
			},
		})
	})
})
