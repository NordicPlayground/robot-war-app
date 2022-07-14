import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import type { Static } from '@sinclair/typebox'
import type {
	gameControllerAdminShadow,
	Position,
} from 'api/validateGameAdminShadow'
import type { MacAddress } from 'api/validateGameControllerShadow'

export type PersistAdminChangeFn = (
	update: Partial<{
		robotTeamAssignment: Static<
			typeof gameControllerAdminShadow
		>['state']['reported']['robotTeamAssignment']

		robotFieldPosition: Record<
			Static<typeof MacAddress>,
			Partial<Static<typeof Position>>
		>
	}>,
) => Promise<void>

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
