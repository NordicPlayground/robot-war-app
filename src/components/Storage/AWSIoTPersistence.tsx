import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { loadGatewayStateIoT } from 'api/loadGatewayStateIoT'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import { persistAdminChanges } from 'core/persistAdminChanges.js'
import { useCore } from 'hooks/useCore.js'
import { useCredentials } from 'hooks/useCredentials.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { createContext, FunctionComponent, ReactNode, useEffect } from 'react'

export const AWSIoTPersistenceContext = createContext(undefined)

export const AWSIoTPersistenceProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const gameInstance = useCore()
	const { region, accessKeyId, secretAccessKey } = useCredentials()
	const { thingName } = useGameControllerThing()

	if (
		thingName !== undefined &&
		accessKeyId !== undefined &&
		secretAccessKey !== undefined
	) {
		// Set up persisting of admin changes to the AWS IoT game controller thing
		persistAdminChanges({
			game: gameInstance,
			persist: persistAdminChangeIoT({
				iotDataPlaneClient: new IoTDataPlaneClient({
					credentials: {
						accessKeyId,
						secretAccessKey,
					},
					region,
				}),
				adminThingName: thingName,
			}),
		}).catch(console.error)
	}

	// Load data from AWS IoT game controller thing
	// - reported robots: loadGatewayStateIoT() -> gameInstance.reportDiscoveredRobots()
	// - admin configuration: loadRobotGameSettings() -> gameInstance.reportRobotGameSettings()
	useEffect(() => {
		if (thingName === undefined) return
		if (accessKeyId === undefined) return
		if (secretAccessKey === undefined) return

		console.debug(`[AWSIoTPersistenceProvider]`, 'loading gateway state!')
		loadGatewayStateIoT({
			iotDataPlaneClient: new IoTDataPlaneClient({
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				region,
			}),
			gatewayThingName: thingName,
		})
			.then((maybeState) => {
				if ('error' in maybeState) {
					console.error(`[AWSIoTPersistenceProvider]`, 'Invalid state, ignore.')
					return
				}
				gameInstance.reportDiscoveredRobots(maybeState.robots)
			})
			.catch(console.error)
	}, [accessKeyId, secretAccessKey, region, thingName, gameInstance])

	return (
		<AWSIoTPersistenceContext.Provider value={undefined}>
			{children}
		</AWSIoTPersistenceContext.Provider>
	)
}
