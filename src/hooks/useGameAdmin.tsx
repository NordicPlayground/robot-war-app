import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import type { Static } from '@sinclair/typebox'
import {
	gameControllerAdminShadow,
	Position,
	TeamId,
	validateGameControllerAdminShadow,
} from 'api/validateGameAdminShadow.js'
import type { MacAddress } from 'api/validateGameControllerShadow.js'
import equal from 'fast-deep-equal'
import { useCredentials } from 'hooks/useCredentials.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

type GameMetadata = Static<
	typeof gameControllerAdminShadow
>['state']['reported']

export const GameAdminContext = createContext<{
	metaData: GameMetadata
	setRobotTeam: (
		robot: Static<typeof MacAddress>,
		teamId: Static<typeof TeamId>,
	) => void
	setRobotPosition: (
		robot: Static<typeof MacAddress>,
		position: Static<typeof Position>,
	) => void
	setAutoUpdate: (update: boolean) => void
}>({
	metaData: {
		robotFieldPosition: {},
		robotTeamAssignment: {},
	},
	setRobotTeam: () => undefined,
	setRobotPosition: () => undefined,
	setAutoUpdate: () => undefined,
})

export const useGameAdmin = () => useContext(GameAdminContext)

export const GameAdminProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [gameMetaData, setGameMetaData] = useState<GameMetadata>({
		// Sample data
		robotTeamAssignment: {
			'00:25:96:FF:FE:12:34:51': 'A',
			'00:25:96:FF:FE:12:34:52': 'A',
			'00:25:96:FF:FE:12:34:53': 'A',
			'00:25:96:FF:FE:12:34:54': 'A',
			'00:25:96:FF:FE:12:34:55': 'B',
			'00:25:96:FF:FE:12:34:56': 'B',
			'00:25:96:FF:FE:12:34:57': 'B',
			'00:25:96:FF:FE:12:34:58': 'B',
		},
		robotFieldPosition: {},
	})
	const { thingName: gameAdminThing } = useGameControllerThing()
	const [autoUpdate, setAutoUpdate] = useState<boolean>(true)
	const { accessKeyId, secretAccessKey, region } = useCredentials()

	let iotDataPlaneClient: IoTDataPlaneClient | undefined = undefined

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

	// If a game controller thing is found, fetch the game metadata
	useEffect(() => {
		if (gameAdminThing === undefined) return
		if (iotDataPlaneClient === undefined) return

		const i = setInterval(() => {
			if (!autoUpdate) return
			;(iotDataPlaneClient as IoTDataPlaneClient)
				.send(
					new GetThingShadowCommand({
						thingName: gameAdminThing,
						shadowName: 'admin',
					}),
				)
				.then(({ payload }) => JSON.parse(new TextDecoder().decode(payload)))
				.then((shadow) => {
					const maybeValidShadow = validateGameControllerAdminShadow(shadow)
					if ('error' in maybeValidShadow) {
						// Validation failed
						console.error(maybeValidShadow.error)
						console.debug(maybeValidShadow.error.details)
						return
					}
					// Meta data is valid
					if (!equal(maybeValidShadow.state.reported, gameMetaData))
						setGameMetaData(maybeValidShadow.state.reported)
				})
				.catch((error) => {
					console.error('Failed to get admin shadow')
					console.error(error)
				})
		}, 2000)

		return () => {
			clearInterval(i)
		}
	}, [gameAdminThing, gameMetaData, autoUpdate, iotDataPlaneClient])

	return (
		<GameAdminContext.Provider
			value={{
				metaData: gameMetaData,
				setAutoUpdate,
				setRobotTeam: (robot, teamId) =>
					iotDataPlaneClient?.send(
						new UpdateThingShadowCommand({
							thingName: gameAdminThing,
							shadowName: 'admin',
							payload: new TextEncoder().encode(
								JSON.stringify({
									state: {
										reported: {
											robotTeamAssignment: {
												[robot]: teamId,
											},
										},
									},
								}),
							),
						}),
					),
				setRobotPosition: (robot, position) =>
					iotDataPlaneClient?.send(
						new UpdateThingShadowCommand({
							thingName: gameAdminThing,
							shadowName: 'admin',
							payload: new TextEncoder().encode(
								JSON.stringify({
									state: {
										reported: {
											robotTeamAssignment: {
												[robot]: position,
											},
										},
									},
								}),
							),
						}),
					),
			}}
		>
			{children}
		</GameAdminContext.Provider>
	)
}
