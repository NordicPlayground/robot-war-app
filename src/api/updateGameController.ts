import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { Static } from '@sinclair/typebox'
import type { DesiredGameState as DesiredGameStateSchema } from 'api/persistence/models/DesiredGameState.js'
import type { ReportedGameState as ReportedGameStateSchema } from 'api/persistence/models/ReportedGameState'
import { validateGameControllerShadow } from 'api/validateGameControllerShadow'
import type { Robot as RobotSchema } from 'core/models/Robot'
import type { RobotInGame as ReportedRobotSchema } from 'core/models/RobotInGame.js'
import type { RobotCommand } from 'hooks/useGameController'

export type Robot = Static<typeof RobotSchema>
export type ReportedRobot = Static<typeof ReportedRobotSchema>
export type ReportedGameState = Static<typeof ReportedGameStateSchema>
export type DesiredGameState = Static<typeof DesiredGameStateSchema>

export const updateGameController =
	({
		iotData,
		controllerThingName,
	}: {
		iotData: IoTDataPlaneClient
		controllerThingName: string
	}) =>
	async (commands: Record<string, RobotCommand>): Promise<void> => {
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

		const reportedGameState = reported
		const desiredGameState = desired ?? {
			robots: {},
		}

		for (const [robotMac, command] of Object.entries(commands)) {
			//commands is the commands we have sent, but how is it retrived?
			console.log('commands: ', commands)
			console.log('reportedGameState: ', reportedGameState.robots[robotMac])
			const robot = reportedGameState.robots[robotMac]
			if (robot === undefined) {
				console.debug(`Robot ${robotMac} unknown!`)
				continue
			}
			const updatedRobot: Robot = {
				...robot,
				angleDeg: robot.angleDeg + command.angleDeg,
				driveTimeMs: command.driveTimeMs,
			}
			desiredGameState.robots = {
				...(desiredGameState.robots ?? {}),
				[robotMac]: updatedRobot,
			}
		}

		console.debug('Updated desired', desiredGameState)
		await iotData
			.send(
				new UpdateThingShadowCommand({
					thingName: controllerThingName,
					payload: fromUtf8(
						JSON.stringify({
							state: {
								desired: desiredGameState,
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
