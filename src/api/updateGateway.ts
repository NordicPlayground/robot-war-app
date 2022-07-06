import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { Static } from '@sinclair/typebox'
import type {
	DesiredRobot as DesiredRobotSchema,
	ReportedRobot as ReportedRobotSchema,
} from 'api/validateGameControllerShadow'
import { validateGameControllerShadow } from 'api/validateGameControllerShadow.js'

export type DesiredRobot = Static<typeof DesiredRobotSchema>
export type ReportedRobot = Static<typeof ReportedRobotSchema>

export const updateGateway =
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
