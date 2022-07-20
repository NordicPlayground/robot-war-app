import type { Static } from '@sinclair/typebox'
import { loadGatewayStateIoT } from 'api/loadGatewayStateIoT.js'
import type { ReportedGameState } from 'api/persistence/models/ReportedGameState.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'

describe('loadGatewayStateIoT()', () => {
	it('should return the reported Gateway state', async () => {
		const expectedState: Static<typeof ReportedGameState> = {
			robots: {
				[randomMac()]: randomRobot(),
				[randomMac()]: randomRobot(),
				[randomMac()]: randomRobot(),
				[randomMac()]: randomRobot(),
			},
		}

		const mockIoTDataPlaneClient = {
			send: jest.fn(async () =>
				Promise.resolve({
					payload: new TextEncoder().encode(
						JSON.stringify({
							state: {
								reported: expectedState,
							},
						}),
					),
				}),
			),
		} as any

		expect(
			await loadGatewayStateIoT({
				iotDataPlaneClient: mockIoTDataPlaneClient,
				gatewayThingName: 'myGameController',
			}),
		).toEqual(expectedState)

		// It should use the thing name given in the argument
		const { thingName, shadowName } = (
			mockIoTDataPlaneClient.send as ReturnType<typeof jest.fn>
		).mock.calls[0][0].input
		expect(thingName).toEqual('myGameController')
		// ... and it requests the default shadow
		expect(shadowName).toBeUndefined()
	})

	it('should return undefined, if the shadow is malformed', async () => {
		const mockIoTDataPlaneClient = {
			send: jest.fn(async () =>
				Promise.resolve({
					payload: new TextEncoder().encode(
						JSON.stringify({
							state: {
								reported: {
									invalidProperty: 'is here',
								},
							},
						}),
					),
				}),
			),
		} as any

		const res = await loadGatewayStateIoT({
			iotDataPlaneClient: mockIoTDataPlaneClient,
			gatewayThingName: 'myGameController',
		})
		expect(res).toHaveProperty('error')
		expect((res as any).error).not.toBeUndefined()
	})
})
