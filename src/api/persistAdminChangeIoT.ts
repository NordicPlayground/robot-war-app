import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import type { PersistAdminChangeFn } from 'core/persistAdminChanges.js'

export const persistAdminChangeIoT =
	({
		iotDataPlaneClient,
		adminThingName,
	}: {
		iotDataPlaneClient: IoTDataPlaneClient
		adminThingName: string
	}): PersistAdminChangeFn =>
	async (update) => {
		await iotDataPlaneClient.send(
			new UpdateThingShadowCommand({
				thingName: adminThingName,
				shadowName: 'admin',
				payload: new TextEncoder().encode(
					JSON.stringify({
						state: {
							reported: update,
						},
					}),
				),
			}),
		)
	}
