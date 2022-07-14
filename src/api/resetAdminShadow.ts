import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import type { Static } from '@sinclair/typebox'
import type { gameControllerAdminShadow } from 'api/validateGameAdminShadow'
type GameMetadata = Static<
	typeof gameControllerAdminShadow
>['state']['reported']

export const resetAdminShadow = async (
	state: { desired?: string | null; reported?: string | null | GameMetadata },
	gameControllerThing: string,
	iotDataPlaneClient: IoTDataPlaneClient,
): Promise<void> => {
	await iotDataPlaneClient
		.send(
			new UpdateThingShadowCommand({
				thingName: gameControllerThing,
				shadowName: 'admin',
				payload: fromUtf8(
					JSON.stringify({
						state: state,
					}),
				),
			}),
		)
		.catch((error) => {
			console.error('Failed to write to reported shadow')
			console.error(error)
		})
}
