import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { Static } from '@sinclair/typebox'
import { calculateReported } from 'api/updateGateway'
import type { ReportedGameState } from 'api/validateGameControllerShadow'
import { validateGameControllerShadow } from 'api/validateGameControllerShadow'
import { Main } from 'components/Main'
import { useCredentials } from 'hooks/useCredentials'
import { useGameControllerThing } from 'hooks/useGameControllerThing'

export const GameControllers = () => {
	const robotCommands = {
		round: 1,
		robots: {
			'00:25:96:FF:FE:12:34:51': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:52': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:53': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:54': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:55': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:56': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:57': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
			'00:25:96:FF:FE:12:34:58': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
		},
	} //What we want to send to the shadow in step 3

	const { thingName: gameControllerThing } = useGameControllerThing()
	const { accessKeyId, secretAccessKey, region } = useCredentials()

	let iotDataPlaneClient: IoTDataPlaneClient | undefined = undefined

	if (accessKeyId === undefined || secretAccessKey === undefined) {
		console.debug('AWS credentials not available')
	} else {
		iotDataPlaneClient = new IoTDataPlaneClient({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		})
	}

	//function that sends the first reported message
	const sendReportedMessage = async (
		reportedCommand: Static<typeof ReportedGameState>,
	) => {
		if (gameControllerThing === undefined) return
		if (iotDataPlaneClient === undefined) return

		await iotDataPlaneClient
			.send(
				new UpdateThingShadowCommand({
					thingName: gameControllerThing,
					payload: fromUtf8(
						JSON.stringify({
							state: {
								reported: reportedCommand,
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

	const getDesiredValuesAndReportBack = async () => {
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

		// Start

		const reportedGameState = calculateReported({
			reported,
			robots: desiredGameState.robots,
		})

		// Finish!
		await sendReportedMessage(reportedGameState)
	}

	return (
		<Main>
			<div className="card">
				<div className="card-header">Steps</div>
				<div className="card-body">
					<ol>
						<li> Trigging the first reported state from the robot</li>
						<button
							onClick={async () => {
								await sendReportedMessage(robotCommands)
							}}
						>
							SEND FIRST REPORTED MESSAGE
						</button>
						{/*Robots should appear on admin and game*/}
						<li> Set angle and drivetime in Game page </li>
						{/*Robots does their thing, and reports back. Get values from desired and put them into reported --> SEND REPORT WITH BUTTON*/}
						<li> Robot gets the desired values, and reports back</li>
						<button
							type="button"
							className="btn btn-danger"
							onClick={async () => {
								await getDesiredValuesAndReportBack()
							}}
						>
							SEND REPORTED
						</button>
						<li>Place robots in admin page</li>
					</ol>
					<p>Repeat step 2,3 and 4 to go through the game</p>
				</div>
			</div>
		</Main>
	)
}
