import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import type { Static } from '@sinclair/typebox'
import {
	ReportedGameState,
	updateGameController,
} from 'api/updateGameController'
import {
	MacAddress,
	validateGameControllerShadow,
} from 'api/validateGameControllerShadow'
import equal from 'fast-deep-equal'
import { useAppConfig } from 'hooks/useAppConfig.js'
import { useCredentials } from 'hooks/useCredentials'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

export type RobotCommand = {
	angleDeg: number
	driveTimeMs: number
}

type ReportedGameStateWithMac = ReportedGameState & {
	robots: Record<
		Static<typeof MacAddress>,
		{
			mac: Static<typeof MacAddress>
		}
	>
}

export const GameControllerContext = createContext<{
	gameState: ReportedGameStateWithMac
	nextRoundCommands: Record<string, RobotCommand>
	teamNameOptions: Record<'name', string>[]
	setNextRoundCommands: (commands: Record<string, RobotCommand>) => void
	addTeamNameOption: (value: string) => void
	resetTeamNameOption: () => void
}>({
	gameState: {
		robots: {},
	},
	nextRoundCommands: {},
	teamNameOptions: [],
	setNextRoundCommands: () => undefined,
	addTeamNameOption: () => undefined,
	resetTeamNameOption: () => undefined,
})

export const useGameController = () => useContext(GameControllerContext)

export const GameControllerProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const { autoUpdateEnabled, autoUpdateIntervalSeconds } = useAppConfig()
	const [gameState, setGameState] = useState<ReportedGameStateWithMac>({
		robots: {},
	})
	const { thingName: gameControllerThing } = useGameControllerThing()
	const { accessKeyId, secretAccessKey, region } = useCredentials()
	const [nextRoundCommands, updateNextRoundCommands] = useState<
		Record<string, RobotCommand>
	>({})
	const [teamNameOptions, setTeamNameOptions] = useState<{ name: string }[]>([
		{ name: 'A' },
		{ name: 'B' },
	])

	let iotDataPlaneClient: IoTDataPlaneClient | undefined = undefined
	let commandHandler: (commands: Record<string, RobotCommand>) => void = () =>
		undefined

	if (accessKeyId === undefined || secretAccessKey === undefined) {
		console.debug('AWS credentials not available')
	} else {
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

	const addTeamNameOption = (newName: string) => {
		setTeamNameOptions((teamNameOptions) => [
			...teamNameOptions,
			{ name: newName },
		])
	}
	const resetTeamNameOption = () => {
		setTeamNameOptions([{ name: 'A' }, { name: 'B' }])
	}

	// If a game controller thing is found, fetch the robot configuration
	useEffect(() => {
		if (gameControllerThing === undefined) return
		if (iotDataPlaneClient === undefined) return

		const i = setInterval(() => {
			if (!autoUpdateEnabled) return
			;(iotDataPlaneClient as IoTDataPlaneClient)
				.send(
					new GetThingShadowCommand({
						thingName: gameControllerThing,
					}),
				)
				.then(({ payload }) => JSON.parse(new TextDecoder().decode(payload)))
				.then((shadow) => {
					const maybeValidShadow = validateGameControllerShadow(shadow)
					if ('error' in maybeValidShadow) {
						// Validation failed
						console.error(maybeValidShadow.error)
						console.debug(maybeValidShadow.error.details)
						return
					}
					// Game shadow is valid
					const newGameSate: ReportedGameStateWithMac = {
						robots: Object.entries(
							maybeValidShadow.state.reported.robots ?? gameState.robots,
						)
							.map(([mac, robot]) => ({
								...robot,
								mac,
							}))
							.reduce(
								(robots, robot) => ({
									...robots,
									[robot.mac]: robot,
								}),
								{} as ReportedGameStateWithMac['robots'],
							),
					}
					if (!equal(newGameSate, gameState)) {
						setGameState(newGameSate)
						console.debug('[useGameAdmin] new game state', gameState)
					}
					// Populate the desired robot configuration ("commands")
					const newCommands: Record<string, RobotCommand> = {}
					Object.entries(maybeValidShadow.state.desired?.robots ?? {}).forEach(
						([mac, command]) => {
							newCommands[mac] = command
						},
					)
					if (!equal(newCommands, nextRoundCommands)) {
						updateNextRoundCommands(newCommands)
						console.debug('[useGameAdmin] new commands', newCommands)
					}
				})
				.catch((error) => {
					console.error('Failed to get shadow')
					console.error(error)
				})
		}, autoUpdateIntervalSeconds * 1000)

		return () => {
			clearInterval(i)
		}
	}, [
		gameControllerThing,
		gameState,
		autoUpdateEnabled,
		autoUpdateIntervalSeconds,
		iotDataPlaneClient,
		nextRoundCommands,
	])

	return (
		<GameControllerContext.Provider
			value={{
				gameState,
				nextRoundCommands,
				teamNameOptions,
				setNextRoundCommands: (commands) => {
					commandHandler(commands)
					updateNextRoundCommands(commands)
				},
				addTeamNameOption,
				resetTeamNameOption,
			}}
		>
			{children}
		</GameControllerContext.Provider>
	)
}
