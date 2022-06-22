import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { RobotCommand } from 'app/pages/Game'

type Robot = {
	mac: string
	driveTimeMs: number
	angleDeg: number
	wheelCircumfenceMm?: number
}

type ReportedRobot = Robot & {
	revolutionCount: number
}

export type ReportedGameState = {
	round: number
	robots: ReportedRobot[]
}

export type DesiredGameState = {
	round: number
	robots: Robot[]
}

export const updateGameController =
	({
		iotData,
		controllerThingName,
	}: {
		iotData: IoTDataPlaneClient
		controllerThingName: string
	}) =>
	async (commands: RobotCommand[]): Promise<void> => {
		const currentShadow = await iotData.send(
			new GetThingShadowCommand({
				thingName: controllerThingName,
			}),
		)

		if (currentShadow.payload === undefined) {
			console.error(`No shadow defined for ${controllerThingName}`)
			return
		}

		const {
			state: { desired, reported },
		} = JSON.parse(toUtf8(currentShadow.payload))
		console.debug('Current desired', desired)
		console.debug('Current reported', reported)

		const reportedGameState = reported as ReportedGameState // FIXME: validate
		const desiredGameState = desired as ReportedGameState // FIXME: validate

		const ourRobotMacs = commands.map(({ robotMac }) => robotMac) // FIXME: use global list of team's robot ids
		const ourRobots = reportedGameState.robots.filter(({ mac: robotId }) =>
			ourRobotMacs.includes(robotId),
		) as Robot[]
		// Fill up with fake robots
		ourRobotMacs.forEach((robotMac) => {
			if (!ourRobots.find(({ mac }) => mac === robotMac)) {
				ourRobots.push({
					mac: robotMac,
					angleDeg: 0,
					driveTimeMs: 0,
				})
			}
		})

		const otherRobots = [
			// Add the robots other teams might have defined
			...desiredGameState.robots.filter((robot) => !ourRobots.includes(robot)),
			// then add the robots the Gateway sees
			...reportedGameState.robots.filter((robot) => !ourRobots.includes(robot)),
		]

		const newDesiredGameSate: Partial<DesiredGameState> = {
			robots: [
				...otherRobots,
				// Only send updates for the current teams robots
				...ourRobots.map((robot) => {
					const command = commands.find(
						({ robotMac: robotId }) => robot.mac === robotId,
					)
					if (command === undefined) return robot
					return {
						...robot,
						angleDeg: robot.angleDeg + command.angleDeg,
						driveTimeMs: command.driveTimeMs,
					}
				}),
			],
		}
		console.debug('New desired', newDesiredGameSate)

		await iotData
			.send(
				new UpdateThingShadowCommand({
					thingName: controllerThingName,
					payload: fromUtf8(
						JSON.stringify({
							state: {
								desired: newDesiredGameSate,
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
