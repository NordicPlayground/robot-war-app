import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { gameEvent2StateUpdate } from 'api/gameEvent2StateUpdate'
import { loadGatewayStateIoT } from 'api/loadGatewayStateIoT'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import type { GameEngineEvent } from 'core/gameEngine'
import { useCore } from 'hooks/useCore.js'
import { useCredentials } from 'hooks/useCredentials.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { createContext, FunctionComponent, ReactNode, useEffect } from 'react'

export const AWSIoTPersistenceContext = createContext(undefined)

export const AWSIoTPersistenceProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const { game: gameInstance } = useCore()
	const { region, accessKeyId, secretAccessKey } = useCredentials()
	const { thingName } = useGameControllerThing()

	useEffect(() => {
		if (thingName === undefined) return
		if (accessKeyId === undefined) return
		if (secretAccessKey === undefined) return
		// Set up persisting of admin changes to the AWS IoT game controller thing
		console.log(`[AWSIoTPersistenceProvider]`, 'setting up connection')
		const persistUpdate = persistAdminChangeIoT({
			iotDataPlaneClient: new IoTDataPlaneClient({
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				region,
			}),
			adminThingName: thingName,
		})

		const eventHandler = async (event: GameEngineEvent) => {
			const update = gameEvent2StateUpdate(event)
			if (update !== undefined) {
				await persistUpdate(update)
			}
		}

		gameInstance.onAll(eventHandler)

		return () => {
			console.log(`[AWSIoTPersistenceProvider]`, 'removing connection')
			gameInstance.offAll(eventHandler)
		}
	}, [thingName, accessKeyId, secretAccessKey, gameInstance, region])

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
