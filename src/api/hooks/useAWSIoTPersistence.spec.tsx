/**
 * @jest-environment jsdom
 */
import { gameEngine } from 'core/gameEngine.js'
import { isolateHook } from 'isolate-react'

describe.skip('useAWSIoTPersistence', () => {
	beforeEach(() => {
		jest.resetModules()
	})

	it('should set up the connection', async () => {
		const iotDataPlaneClient = jest.fn()
		jest.mock('api/hooks/useIoTDataPlaneClient.js', () => ({
			useIoTDataPlaneClient: () => iotDataPlaneClient,
		}))

		const persistAdminChangeIoT = jest.fn()
		jest.mock('api/persistAdminChangeIoT.js', () => ({
			persistAdminChangeIoT,
		}))

		jest.mock('hooks/useGameControllerThing.js', () => ({
			useGameControllerThing: () => ({
				thingName: 'GameControllerThing',
			}),
		}))

		const disconnect = jest.fn()
		const connect = jest.fn(() => disconnect)
		jest.mock('hooks/useGameStorage.js', () => ({
			useGameStorage: () => connect,
		}))

		const game = gameEngine({
			field: {
				heightMm: 1000,
				widthMm: 1500,
			},
		})

		jest.mock('hooks/useCore.js', () => ({
			useCore: () => ({
				game,
			}),
		}))

		const { useAWSIoTPersistence } = await import(
			'api/hooks/useAWSIoTPersistence.js'
		)

		const isolated = isolateHook(useAWSIoTPersistence)
		isolated()

		expect(connect).toHaveBeenCalledWith({
			game,
			persistAdminChangeIoT,
		})
		expect(persistAdminChangeIoT).toHaveBeenCalledWith({
			thingName: 'GameControllerThing',
			iotDataPlaneClient,
		})

		// It should clean up
		expect(disconnect).toHaveBeenCalledTimes(1)
		// unmount
		isolated.cleanup()
		expect(disconnect).toHaveBeenCalledTimes(1)
	})
})
