import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { Static } from '@sinclair/typebox'
import type {
	DesiredGameState,
	DesiredRobot as DesiredRobotSchema,
	ReportedGameState,
	ReportedRobot as ReportedRobotSchema,
} from 'api/validateGameControllerShadow'
import { validateGameControllerShadow } from 'api/validateGameControllerShadow.js'

export type DesiredRobot = Static<typeof DesiredRobotSchema>
export type ReportedRobot = Static<typeof ReportedRobotSchema>

export const updateGatewayController =
	({
		iotData,
		controllerThingName,
	}: {
		iotData: IoTDataPlaneClient
		controllerThingName: string
	}) =>
	async (): Promise<void> => {
		const currentShadow = await iotData.send(
			new GetThingShadowCommand({
				thingName: controllerThingName,
			}),
		)

		if (currentShadow.payload === undefined) {
			console.error(`No shadow defined for ${controllerThingName}`)
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

		console.debug('Current desired', desired)
		console.debug('Current reported', reported)

		const desiredGameState = desired ?? {
			robots: {},
		}

		console.debug('Updated desired', desiredGameState)
		console.log('desired:', desiredGameState)

		await iotData
			.send(
				new UpdateThingShadowCommand({
					thingName: controllerThingName,
					payload: fromUtf8(
						JSON.stringify({
							state: {
								reported: desiredGameState,
							},
						}),
					),
				}),
			)
			.catch((error) => {
				console.error('Failed to write to shadow')
				console.error(error)
			})
	}

export const calculateReported = ({
	robots,
	reported,
}: {
	reported: Static<typeof ReportedGameState>
	robots: Required<Static<typeof DesiredGameState>>['robots']
}): Static<typeof ReportedGameState> => {
	const reportedGameState: Static<typeof ReportedGameState> = {
		...reported,
	}

	for (const [robotMac, command] of Object.entries(robots)) {
		const updatedRobot: ReportedRobot = {
			...reported.robots[robotMac],
			angleDeg: command.angleDeg,
			driveTimeMs: command.driveTimeMs,
			revolutionCount: 0,
		}
		reportedGameState.robots = {
			...reportedGameState.robots,
			[robotMac]: updatedRobot,
		}
	}

	return reportedGameState
}
