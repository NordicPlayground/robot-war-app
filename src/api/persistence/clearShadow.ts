import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'

export const clearShadow =
	({
		iotDataPlaneClient,
		thingName,
		shadowName,
	}: {
		iotDataPlaneClient: IoTDataPlaneClient
		thingName: string
		shadowName?: undefined | 'admin'
	}) =>
	async (): Promise<void> => {
		await iotDataPlaneClient.send(
			new UpdateThingShadowCommand({
				thingName: thingName,
				shadowName,
				payload: new TextEncoder().encode(
					JSON.stringify({
						state: {
							desired: null,
							reported: null,
						},
					}),
				),
			}),
		)
	}
