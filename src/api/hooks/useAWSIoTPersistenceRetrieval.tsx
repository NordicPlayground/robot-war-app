import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient'
import { loadGatewayStateIoT } from 'api/loadGatewayStateIoT.js'
import { useCore } from 'hooks/useCore.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { useEffect } from 'react'

/**
 * Load data from AWS IoT game controller thing
 *  - reported robots: loadGatewayStateIoT() -> gameInstance.gatewayReportDiscoveredRobots()
 *  - TODO: admin configuration: loadRobotGameSettings() -> gameInstance.reportRobotGameSettings()
 */

export const useAWSIoTPersistenceRetrieval = () => {
	const { game: gameInstance } = useCore()
	const { thingName } = useGameControllerThing()
	const iotDataPlaneClient = useIoTDataPlaneClient()

	useEffect(() => {
		if (thingName === undefined) return
		if (iotDataPlaneClient === undefined) return

		console.debug(`[AWSIoTPersistenceProvider]`, 'loading gateway state!')
		loadGatewayStateIoT({
			iotDataPlaneClient,
			gatewayThingName: thingName,
		})
			.then((maybeState) => {
				if ('error' in maybeState) {
					console.error(`[AWSIoTPersistenceProvider]`, 'Invalid state, ignore.')
					return
				}
				gameInstance.gatewayReportDiscoveredRobots(maybeState.robots)
			})
			.catch(console.error)
	}, [iotDataPlaneClient, thingName, gameInstance])
}
