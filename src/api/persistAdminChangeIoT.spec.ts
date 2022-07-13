import type { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import { randomMac } from 'core/test/randomMac.js'

describe('persistAdminChangeIoT()', () => {
	it('should persist changes by admins to an AWS IoT thing shadow', async () => {
		const mockIoTDataPlaneClient: IoTDataPlaneClient = {
			send: jest.fn(async () => Promise.resolve()),
		} as any

		const adminThingName = `adminThing${randomMac().replace(/:/g, '')}`
		const address = randomMac()
		await persistAdminChangeIoT({
			iotDataPlaneClient: mockIoTDataPlaneClient,
			adminThingName,
		})({
			robotTeamAssignment: {
				[address]: 'Team A',
			},
		})

		const { thingName, shadowName, payload } = (
			mockIoTDataPlaneClient.send as ReturnType<typeof jest.fn>
		).mock.calls[0][0].input

		expect(thingName).toEqual(adminThingName)
		expect(shadowName).toEqual('admin')
		expect(JSON.parse(new TextDecoder().decode(payload))).toEqual({
			state: {
				reported: {
					robotTeamAssignment: {
						[address]: 'Team A',
					},
				},
			},
		})
	})
})
