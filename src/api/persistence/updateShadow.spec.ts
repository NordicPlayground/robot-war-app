import type { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { AdminShadow } from 'api/persistence/models/AdminShadow.js'
import { updateShadow } from 'api/persistence/updateShadow.js'
import { randomMac } from 'core/test/randomMac.js'

describe('updateShadow()', () => {
	it('should persist changes to an AWS IoT thing shadow', async () => {
		const mockIoTDataPlaneClient: IoTDataPlaneClient = {
			send: jest.fn(async () => Promise.resolve()),
		} as any

		const randomThingName = `thing${randomMac().replace(/:/g, '')}`
		const address = randomMac()
		await updateShadow({
			iotDataPlaneClient: mockIoTDataPlaneClient,
			thingName: randomThingName,
			schema: AdminShadow,
			shadowName: 'admin',
		})({
			reported: {
				robotTeamAssignment: {
					[address]: 'Team A',
				},
				robotFieldPosition: {
					[address]: {
						rotationDeg: 90,
						xMm: 42,
						yMm: 17,
					},
				},
			},
		})

		const { thingName, shadowName, payload } = (
			mockIoTDataPlaneClient.send as ReturnType<typeof jest.fn>
		).mock.calls[0][0].input

		expect(thingName).toEqual(randomThingName)
		expect(shadowName).toEqual('admin')
		expect(JSON.parse(new TextDecoder().decode(payload))).toEqual({
			state: {
				reported: {
					robotTeamAssignment: {
						[address]: 'Team A',
					},
					robotFieldPosition: {
						[address]: {
							rotationDeg: 90,
							xMm: 42,
							yMm: 17,
						},
					},
				},
			},
		})
	})
})
