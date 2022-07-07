import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import type { Static } from '@sinclair/typebox'
import type { ReportedGameState } from 'api/validateGameControllerShadow'

export const sendDesiredMessage = async (
	reportedCommand: Static<typeof ReportedGameState> | null,
	gameControllerThing: string,
	iotDataPlaneClient: IoTDataPlaneClient,
): Promise<void> => {
	await iotDataPlaneClient
		.send(
			new UpdateThingShadowCommand({
				thingName: gameControllerThing,
				payload: fromUtf8(
					JSON.stringify({
						state: {
							desired: reportedCommand,
						},
					}),
				),
			}),
		)
		.catch((error) => {
			console.error('Failed to write to  reported shadow')
			console.error(error)
		})
}
