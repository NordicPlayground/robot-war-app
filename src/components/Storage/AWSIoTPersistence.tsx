import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import { persistAdminChanges } from 'core/persistAdminChanges.js'
import { useCore } from 'hooks/useCore.js'
import { useCredentials } from 'hooks/useCredentials.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { createContext, FunctionComponent, ReactNode } from 'react'

export const AWSIoTPersistenceContext = createContext(undefined)

export const AWSIoTPersistenceProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const gameInstance = useCore()
	const { region, accessKeyId, secretAccessKey } = useCredentials()
	const { thingName } = useGameControllerThing()

	if (
		thingName !== undefined &&
		region !== undefined &&
		accessKeyId !== undefined &&
		secretAccessKey !== undefined
	) {
		const persist = persistAdminChangeIoT({
			iotDataPlaneClient: new IoTDataPlaneClient({
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				region,
			}),
			adminThingName: thingName,
		})

		persistAdminChanges({
			game: gameInstance,
			persist,
		}).catch(console.error)
	}

	return (
		<AWSIoTPersistenceContext.Provider value={undefined}>
			{children}
		</AWSIoTPersistenceContext.Provider>
	)
}
