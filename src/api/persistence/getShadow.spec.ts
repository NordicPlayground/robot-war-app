import { AWSIoTShadow, getShadow } from 'api/persistence/getShadow.js'
import { GameControllerShadow } from 'api/persistence/models/GameControllerShadow.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'

describe('getShadow()', () => {
	it('should return the reported Gateway state', async () => {
		const expectedState: AWSIoTShadow<typeof GameControllerShadow> = {
			state: {
				reported: {
					robots: {
						[randomMac()]: randomRobot(),
						[randomMac()]: randomRobot(),
						[randomMac()]: randomRobot(),
						[randomMac()]: randomRobot(),
					},
				},
			},
			metadata: {
				desired: {},
				reported: {},
			},
			version: 42,
			timestamp: Date.now(),
		}

		const mockIoTDataPlaneClient = {
			send: jest.fn(async () =>
				Promise.resolve({
					payload: new TextEncoder().encode(JSON.stringify(expectedState)),
				}),
			),
		} as any

		expect(
			await getShadow({
				iotDataPlaneClient: mockIoTDataPlaneClient,
				thingName: 'myGameController',
				schema: GameControllerShadow,
			})(),
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

		const res = await getShadow({
			iotDataPlaneClient: mockIoTDataPlaneClient,
			thingName: 'myGameController',
			schema: GameControllerShadow,
		})()
		expect(res).toHaveProperty('error')
		expect((res as any).error).not.toBeUndefined()
	})
})
