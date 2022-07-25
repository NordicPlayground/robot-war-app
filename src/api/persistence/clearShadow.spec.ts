import type { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { clearShadow } from 'api/persistence/clearShadow.js'
import { randomMac } from 'core/test/randomMac.js'

describe('clearShadow()', () => {
	it('should persist changes to an AWS IoT thing shadow', async () => {
		const mockIoTDataPlaneClient: IoTDataPlaneClient = {
			send: jest.fn(async () => Promise.resolve()),
		} as any

		const randomThingName = `thing${randomMac().replace(/:/g, '')}`
		await clearShadow({
			iotDataPlaneClient: mockIoTDataPlaneClient,
			thingName: randomThingName,
			shadowName: 'admin',
		})()

		const { thingName, shadowName, payload } = (
			mockIoTDataPlaneClient.send as ReturnType<typeof jest.fn>
		).mock.calls[0][0].input

		expect(thingName).toEqual(randomThingName)
		expect(shadowName).toEqual('admin')
		expect(JSON.parse(new TextDecoder().decode(payload))).toEqual({
			state: {
				reported: null,
				desired: null,
			},
		})
	})
})
