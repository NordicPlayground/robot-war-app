import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { calculateReported } from 'api/calculateReported'
import { sendReportedMessage } from 'api/sendReportedMessage'
import { validateGameControllerShadow } from 'api/validateGameControllerShadow'

export const getReportedForSimulator = async (
	gameControllerThing?: string,
	iotDataPlaneClient?: IoTDataPlaneClient,
): Promise<void> => {
	if (gameControllerThing === undefined) return
	if (iotDataPlaneClient === undefined) return

	const currentShadow = await iotDataPlaneClient.send(
		new GetThingShadowCommand({
			thingName: gameControllerThing,
		}),
	)

	if (currentShadow.payload === undefined) {
		console.error(`No shadow defined for ${gameControllerThing}`)
		return
	}

	const shadow = JSON.parse(toUtf8(currentShadow.payload))

	const maybeValidShadow = validateGameControllerShadow(shadow)

	if ('error' in maybeValidShadow) {
		console.error(`Failed to validate game controller shadow!`)
		console.error(maybeValidShadow.error)
		return
	}

	const {
		state: { desired, reported },
	} = maybeValidShadow

	const desiredGameState = desired ?? {
		robots: {},
	}

	if (desiredGameState.robots === undefined) return

	const reportedGameState = calculateReported({
		reported,
		robots: desiredGameState.robots,
	})

	await sendReportedMessage(
		reportedGameState,
		gameControllerThing,
		iotDataPlaneClient,
	)
}
