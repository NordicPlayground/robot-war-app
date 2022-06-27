import { IoTClient, ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { useCredentials } from 'hooks/useCredentials'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

export const GameControllerThingContext = createContext<{
	thingName?: string
}>({})

export const useGameControllerThing = () =>
	useContext(GameControllerThingContext)

export const GameControllerThingProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [thingName, setThingName] = useState<string>()
	const { accessKeyId, secretAccessKey, region } = useCredentials()

	let iotClient: IoTClient | undefined = undefined
	let iotDataPlaneClient: IoTDataPlaneClient | undefined = undefined

	if (accessKeyId === undefined || secretAccessKey === undefined) {
		console.debug('AWS credentials not available')
	} else {
		iotClient = new IoTClient({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		})
		iotDataPlaneClient = new IoTDataPlaneClient({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		})
	}

	useEffect(() => {
		if (iotClient === undefined) return
		iotClient
			.send(
				new ListThingsInThingGroupCommand({
					thingGroupName: 'gameControllerThing',
				}),
			)
			.then(({ things }) => {
				// use the first we find, we might later want to have a selection
				setThingName(things?.[1])
			})
			.catch((error) => {
				console.error('Failed to list things in group')
				console.error(error)
			})
	}, [iotClient])

	return (
		<GameControllerThingContext.Provider
			value={{
				thingName,
			}}
		>
			{children}
		</GameControllerThingContext.Provider>
	)
}
