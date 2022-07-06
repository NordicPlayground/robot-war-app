import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { getReportedForSimulator } from 'api/getReportedForSimulator'
import { sendReportedMessage } from 'api/sendReportedMessage'
import { Main } from 'components/Main'
import { useCredentials } from 'hooks/useCredentials'
import { useGameControllerThing } from 'hooks/useGameControllerThing'
import { robotCommands } from 'utils/initialReportedState'

export const GameControllers = () => {
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

	return (
		<Main>
			<div className="card">
				<div className="card-header">Steps</div>
				<div className="card-body">
					<ol>
						<li> Trigging the first reported state from the robot</li>
						<button
							onClick={async () => {
								await sendReportedMessage(
									robotCommands,
									gameControllerThing,
									iotDataPlaneClient,
								)
							}}
						>
							SEND FIRST REPORTED MESSAGE
						</button>
						<li> Set angle and drivetime in Game page </li>
						<li> Robot gets the desired values, and reports back</li>
						<button
							type="button"
							className="btn btn-danger"
							onClick={async () => {
								await getReportedForSimulator(
									gameControllerThing,
									iotDataPlaneClient,
								)
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
