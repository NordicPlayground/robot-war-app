/**
 * @jest-environment jsdom
 */
import { gameEngine } from 'core/gameEngine.js'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'

// FIXME: make test work
describe.skip('AWSIoTPersistence', () => {
	let container: HTMLDivElement | null = null

	beforeEach(() => {
		jest.resetModules()
		container = document.createElement('div')
		document.body.appendChild(container)
	})

	afterEach(() => {
		if (container !== null) document.body.removeChild(container)
		container = null
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

		const { AWSIoTPersistenceProvider } = await import(
			'components/Storage/AWSIoTPersistence.js'
		)
		const root = createRoot(container as HTMLDivElement)

		act(() => {
			root.render(<AWSIoTPersistenceProvider>null</AWSIoTPersistenceProvider>)
		})

		expect(connect).toHaveBeenCalledWith({
			game,
			persistAdminChangeIoT,
		})
		expect(persistAdminChangeIoT).toHaveBeenCalledWith({
			adminThingName: 'GameControllerThing',
			iotDataPlaneClient,
		})

		// It should clean up
		expect(disconnect).toHaveBeenCalledTimes(1)
		// unmount the app
		act(() => {
			root.render(null)
		})
		expect(disconnect).toHaveBeenCalledTimes(1)
	})
})
