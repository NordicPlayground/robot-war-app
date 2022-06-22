import { IoTClient, ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'
import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import {
	ReportedGameState,
	updateGameController,
} from 'api/updateGameController'
import type { RobotCommand } from 'app/pages/Game'
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

export const GameControllerContext = createContext<{
	gameState: ReportedGameState
	nextRoundCommands: (commands: RobotCommand[]) => void
	setAutoUpdate: (update: boolean) => void
}>({
	gameState: {
		round: 1,
		robots: [],
	},
	nextRoundCommands: () => undefined,
	setAutoUpdate: () => undefined,
})

export const useGameController = () => useContext(GameControllerContext)

export const GameControllerProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [gameState, setGameState] = useState<ReportedGameState>({
		round: 1,
		robots: [],
	})
	const [gameControllerThing, setGameControllerThing] = useState<string>()
	const [autoUpdate, setAutoUpdate] = useState<boolean>(true)
	const { accessKeyId, secretAccessKey, region } = useCredentials()

	let iotClient: IoTClient | undefined = undefined
	let iotDataPlaneClient: IoTDataPlaneClient | undefined = undefined
	let commandHandler: (commands: RobotCommand[]) => void = () => undefined

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

	if (iotDataPlaneClient !== undefined && gameControllerThing !== undefined) {
		commandHandler = updateGameController({
			iotData: iotDataPlaneClient,
			controllerThingName: gameControllerThing,
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
					const newGameSate: ReportedGameState = {
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

	return (
		<GameControllerContext.Provider
			value={{
				gameState,
				nextRoundCommands: commandHandler,
				setAutoUpdate,
			}}
		>
			{children}
		</GameControllerContext.Provider>
	)
}
