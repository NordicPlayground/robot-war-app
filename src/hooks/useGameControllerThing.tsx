import { IoTClient, ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'
import { useCredentials } from 'hooks/useCredentials.js'
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
	}

	useEffect(() => {
		if (iotClient === undefined) return
		iotClient
			.send(
				new ListThingsInThingGroupCommand({
					thingGroupName: 'gameController',
				}),
			)
			.then(({ things }) => {
				setThingName(things?.filter((thing) => thing === 'gameController')[0])
			})

			.catch((error) => {
				console.error(
					'Failed to list things in group. No thing called gameController.',
				)
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
