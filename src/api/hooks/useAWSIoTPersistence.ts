import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient.js'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import { useCore } from 'hooks/useCore.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { useGameStorage } from 'hooks/useGameStorage.js'
import { useEffect } from 'react'

export const useAWSIoTPersistence = (): void => {
	const connectStorage = useGameStorage()
	const { game } = useCore()
	const { thingName } = useGameControllerThing()
	const iotDataPlaneClient = useIoTDataPlaneClient()
	// FIXME: also load data useAWSIoTPersistenceRetrieval(), but refactor it to be used like connectStorage()

	useEffect(() => {
		if (thingName === undefined) return
		if (iotDataPlaneClient === undefined) return
		const disconnect = connectStorage({
			game,
			persist: persistAdminChangeIoT({
				adminThingName: thingName,
				iotDataPlaneClient,
			}),
		})
		return disconnect
	}, [game, thingName, iotDataPlaneClient, connectStorage])
}
