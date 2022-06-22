import { IoTClient, ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'
import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import equal from 'fast-deep-equal'
import { useCredentials } from 'hooks/useCredentials'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

type Robot = {
	id: string
	driveTime: number
	angle: number
	revolutions: number
}

export type GameState = {
	round: number
	robots: Robot[]
}

export const GameControllerContext = createContext<{
	gameState: GameState
	nextGameState: (next: GameState) => void
	setAutoUpdate: (update: boolean) => void
}>({
	gameState: {
		round: 1,
		robots: [],
	},
	nextGameState: () => undefined,
	setAutoUpdate: () => undefined,
})

export const useGameController = () => useContext(GameControllerContext)

export const GameControllerProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [gameState, setGameState] = useState<GameState>({
		round: 1,
		robots: [],
	})
	const [gameControllerThing, setGameControllerThing] = useState<string>()
	const [autoUpdate, setAutoUpdate] = useState<boolean>(true)
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
					thingGroupName: 'gameController',
				}),
			)
			.then(({ things }) => {
				// use the first we find, we might later want to have a selection
				setGameControllerThing(things?.[1])
			})
			.catch((error) => {
				console.error('Failed to list things in group')
				console.error(error)
			})
	}, [iotClient])

	// If a game controller thing is found, fetch state
	useEffect(() => {
		if (gameControllerThing === undefined) return
		if (iotDataPlaneClient === undefined) return

		const i = setInterval(() => {
			if (!autoUpdate) return
			;(iotDataPlaneClient as IoTDataPlaneClient)
				.send(
					new GetThingShadowCommand({
						thingName: gameControllerThing,
					}),
				)
				.then(({ payload }) => JSON.parse(new TextDecoder().decode(payload)))
				.then((shadow) => {
					const newGameSate: GameState = {
						round: shadow?.state?.reported?.round ?? gameState.round,
						robots: shadow?.state?.reported?.robots ?? gameState.robots,
					} // TODO: validate game state using ajv
					if (!equal(newGameSate, gameState)) setGameState(newGameSate)
				})
				.catch((error) => {
					console.error('Failed to get shadow')
					console.error(error)
				})
		}, 2000)

		return () => {
			clearInterval(i)
		}
	}, [gameControllerThing, gameState, autoUpdate, iotDataPlaneClient])

	useEffect(() => {
		if (gameControllerThing === undefined) return
		if (iotDataPlaneClient === undefined) return
		const i = setInterval(() => {
			if (!autoUpdate) return
			;(iotDataPlaneClient as IoTDataPlaneClient)
				.send(
					new UpdateThingShadowCommand({
						thingName: gameControllerThing,
						payload: fromUtf8(
							JSON.stringify({
								state: {
									desired: {
										round: 5,
										robots: [],
									},
								},
							}),
						),
					}),
				)
				.catch((error) => {
					console.error('Failed to write to shadow')
					console.error(error)
				})
		}, 2000)

		return () => {
			clearInterval(i)
		}
	}, [gameControllerThing, gameState, autoUpdate, iotDataPlaneClient])

	return (
		<GameControllerContext.Provider
			value={{
				gameState,
				nextGameState: () => undefined,
				setAutoUpdate,
			}}
		>
			{children}
		</GameControllerContext.Provider>
	)
}
