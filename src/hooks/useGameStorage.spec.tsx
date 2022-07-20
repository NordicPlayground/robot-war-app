import type { PersistAdminChangeFn } from 'api/persistAdminChangeIoT'
import { gameEngine } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { useGameStorage } from 'hooks/useGameStorage.js'

describe('useGameStorage', () => {
	let disconnect: () => void

	const game = gameEngine({
		field: {
			heightMm: 1000,
			widthMm: 1500,
		},
	})
	const robot = randomMac()
	game.gatewayReportDiscoveredRobots({
		[robot]: randomRobot(),
	})
	const mockPersistFN: PersistAdminChangeFn = jest.fn()

	it('should persist changes', async () => {
		const connect = useGameStorage()
		disconnect = connect({
			game,
			persist: mockPersistFN,
		})

		// When an admin changes something ...
		game.adminAssignRobotToTeam(robot, 'Team A')

		// ... the persistence function should be called
		expect(mockPersistFN).toHaveBeenCalledTimes(1)
		expect(mockPersistFN).toHaveBeenCalledWith({
			robotTeamAssignment: {
				[robot]: 'Team A',
			},
		})
	})

	it('should unregister the connection when disconnect() is called', () => {
		expect(disconnect).not.toBeUndefined()
		disconnect?.()
		game.adminAssignRobotToTeam(robot, 'Team B')
		// It should not call the persist function again
		expect(mockPersistFN).toHaveBeenCalledTimes(1)
	})
})
