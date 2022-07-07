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
	selectedTeam: string | undefined
	setNextRoundCommands: (commands: Record<string, RobotCommand>) => void
	setAutoUpdate: (update: boolean) => void
	addTeamNameOption: (value: string) => void
	setSelectedTeam: (value: string) => void
}>({
	gameState: {
		round: 1,
		robots: {},
	},
	nextRoundCommands: {},
	teamNameOptions: [],
	selectedTeam: undefined,
	setNextRoundCommands: () => undefined,
	setAutoUpdate: () => undefined,
	addTeamNameOption: () => undefined,
	setSelectedTeam: () => undefined,
})

export const useGameController = () => useContext(GameControllerContext)

export const GameControllerProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [gameState, setGameState] = useState<ReportedGameStateWithMac>({
		round: 1,
		robots: {},
	})
	const { thingName: gameControllerThing } = useGameControllerThing()
	const [autoUpdate, setAutoUpdate] = useState<boolean>(true)
	const { accessKeyId, secretAccessKey, region } = useCredentials()
	const [nextRoundCommands, updateNextRoundCommands] = useState<
		Record<string, RobotCommand>
	>({})
	const [teamNameOptions, setTeamNameOptions] = useState<{ name: string }[]>([
		{ name: 'A' },
		{ name: 'B' },
	])
	const [selectedTeam, setSelectedTeam] = useState<string>()

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

	// If a game controller thing is found, fetch the robot configuration
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
					const maybeValidShadow = validateGameControllerShadow(shadow)
					if ('error' in maybeValidShadow) {
						// Validation failed
						console.error(maybeValidShadow.error)
						console.debug(maybeValidShadow.error.details)
						return
					}
					// Game shadow is valid
					const newGameSate: ReportedGameStateWithMac = {
						round: maybeValidShadow.state.reported.round ?? gameState.round,
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
		}, 2000)

		return () => {
			clearInterval(i)
		}
	}, [
		gameControllerThing,
		gameState,
		autoUpdate,
		iotDataPlaneClient,
		nextRoundCommands,
	])

	return (
		<GameControllerContext.Provider
			value={{
				gameState,
				nextRoundCommands,
				teamNameOptions,
				selectedTeam,
				setNextRoundCommands: (commands) => {
					commandHandler(commands)
					updateNextRoundCommands(commands)
				},
				setAutoUpdate,
				addTeamNameOption,
				setSelectedTeam,
			}}
		>
			{children}
		</GameControllerContext.Provider>
	)
}
