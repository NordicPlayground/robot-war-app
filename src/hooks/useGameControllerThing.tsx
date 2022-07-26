import { ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'
import type { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import type { Static } from '@sinclair/typebox'
import { useIoTClient } from 'api/hooks/useIoTClient'
import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient'
import { clearShadow } from 'api/persistence/clearShadow'
import type { ErrorInfo } from 'api/persistence/errors/ErrorInfo'
import { AWSIoTShadow, getShadow } from 'api/persistence/getShadow'
import { AdminShadow } from 'api/persistence/models/AdminShadow'
import { GameControllerShadow } from 'api/persistence/models/GameControllerShadow'
import { updateShadow } from 'api/persistence/updateShadow'
import type { GameEngine } from 'core/gameEngine'
import { useCore } from 'hooks/useCore'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

const notReady = () => {
	console.error('[useGameControllerThing]', 'Not ready!')
}
const notReadyPromise = async () =>
	Promise.reject(new Error(`[useGameControllerThing] Not ready!`))
const dummyStateFns: ReturnType<typeof stateFunctions> = {
	reset: notReady,
	resetAdmin: notReady,
	report: notReady,
	reportDesired: notReady,
	getState: notReadyPromise,
	getAdminState: notReadyPromise,
}

export const GameControllerThingContext = createContext<
	{
		thingName?: string
	} & ReturnType<typeof stateFunctions>
>(dummyStateFns)

export const useGameControllerThing = () =>
	useContext(GameControllerThingContext)

const stateFunctions = ({
	thingName,
	iotDataPlaneClient,
	game,
}: {
	thingName: string
	iotDataPlaneClient: IoTDataPlaneClient
	game: GameEngine
}): {
	/**
	 * Returns the current shadow of the GameController
	 */
	getState: () => Promise<ErrorInfo | AWSIoTShadow<typeof GameControllerShadow>>
	/**
	 * Write the given robots to the GameController default shadow
	 */
	report: (
		robots: Static<typeof GameControllerShadow>['reported']['robots'],
	) => void
	/**
	 * Report the desired values back as reported
	 */
	reportDesired: () => void
	/**
	 * Reset the GameController default shadow
	 */
	reset: () => void
	/**
	 * Reset the GameController admin shadow
	 */
	resetAdmin: () => void
	/**
	 * Returns the current admin shadow of the GameController
	 */
	getAdminState: () => Promise<ErrorInfo | AWSIoTShadow<typeof AdminShadow>>
} => {
	const updateGatewayShadow = updateShadow({
		iotDataPlaneClient,
		thingName,
		schema: GameControllerShadow,
	})
	const getGatewayShadow = getShadow({
		iotDataPlaneClient,
		thingName,
		schema: GameControllerShadow,
	})
	const clearGatewayShadow = clearShadow({
		iotDataPlaneClient,
		thingName,
	})
	const clearAdminShadow = clearShadow({
		iotDataPlaneClient,
		thingName,
		shadowName: 'admin',
	})
	const getAdminShadow = getShadow({
		iotDataPlaneClient,
		thingName,
		schema: AdminShadow,
		shadowName: 'admin',
	})
	return {
		reset: () => {
			clearGatewayShadow().catch(console.error)
		},
		resetAdmin: () => {
			clearAdminShadow().catch(console.error)
		},
		report: (robots) => {
			updateGatewayShadow({ reported: { robots } }).catch(console.error)
			game.gatewayReportDiscoveredRobots(robots)
		},
		reportDesired: () => {
			getGatewayShadow()
				.then((maybeShadow) => {
					if ('error' in maybeShadow) {
						console.error(maybeShadow)
						return
					}
					updateGatewayShadow({
						reported: maybeShadow.state.desired,
					}).catch(console.error)
				})
				.catch(console.error)
		},
		getState: async () => getGatewayShadow(),
		getAdminState: async () => getAdminShadow(),
	}
}

const boundStateFunctions: Record<
	string,
	ReturnType<typeof stateFunctions>
> = {}

export const GameControllerThingProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const { game } = useCore()
	const [thingName, setThingName] = useState<string>()

	const iotClient = useIoTClient()
	if (iotClient === undefined) {
		console.debug('iotClient not available')
	}

	const iotDataPlaneClient = useIoTDataPlaneClient()
	if (iotDataPlaneClient === undefined) {
		console.debug('iotDataPlaneClient not available')
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

	if (
		thingName !== undefined &&
		iotDataPlaneClient !== undefined &&
		boundStateFunctions[thingName] === undefined
	) {
		boundStateFunctions[thingName] = stateFunctions({
			thingName,
			iotDataPlaneClient,
			game,
		})
	}

	const stateFns: ReturnType<typeof stateFunctions> =
		boundStateFunctions[thingName ?? ''] ?? dummyStateFns

	return (
		<GameControllerThingContext.Provider
			value={{
				thingName,
				...stateFns,
			}}
		>
			{children}
		</GameControllerThingContext.Provider>
	)
}
