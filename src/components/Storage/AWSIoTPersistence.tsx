import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient.js'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import { useCore } from 'hooks/useCore.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { useGameStorage } from 'hooks/useGameStorage.js'
import { createContext, FunctionComponent, ReactNode, useEffect } from 'react'

export const AWSIoTPersistenceContext = createContext(undefined)

export const AWSIoTPersistenceProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const connectStorage = useGameStorage()
	const { game } = useCore()
	const { thingName } = useGameControllerThing()
	const iotDataPlaneClient = useIoTDataPlaneClient()
	// FIXME: also load data useAWSIoTPersistenceRetrieval()

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

	return (
		<AWSIoTPersistenceContext.Provider value={undefined}>
			{children}
		</AWSIoTPersistenceContext.Provider>
	)
}
