import { IoTClient, ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'

export const listGameControllerThings =
	({ iotClient }: { iotClient: IoTClient }) =>
	async (): Promise<string[]> =>
		iotClient
			.send(
				new ListThingsInThingGroupCommand({
					thingGroupName: 'gameController',
				}),
			)
			.then(({ things }) => (things ?? []).sort((a, b) => a.localeCompare(b)))
