import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import type { Static } from '@sinclair/typebox'
import type { ReportedGameState } from 'api/persistence/models/ReportedGameState'
import { validateGameControllerShadow } from 'api/validateGameControllerShadow.js'

export const loadGatewayStateIoT = async ({
	iotDataPlaneClient,
	gatewayThingName,
}: {
	iotDataPlaneClient: IoTDataPlaneClient
	gatewayThingName: string
}): Promise<Static<typeof ReportedGameState> | { error: Error }> => {
	const res = await iotDataPlaneClient.send(
		new GetThingShadowCommand({
			thingName: gatewayThingName,
		}),
	)

	const shadow = JSON.parse(new TextDecoder().decode(res.payload))

	const maybeValidShadow = validateGameControllerShadow(shadow)
	if ('error' in maybeValidShadow) {
		// Validation failed
		return { error: maybeValidShadow.error }
	}
	return maybeValidShadow.state.reported
}
