import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'

export const resetShadow = async (
	state: { desired?: string | null; reported?: string | null },
	gameControllerThing: string,
	iotDataPlaneClient: IoTDataPlaneClient,
): Promise<void> => {
	await iotDataPlaneClient
		.send(
			new UpdateThingShadowCommand({
				thingName: gameControllerThing,
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
