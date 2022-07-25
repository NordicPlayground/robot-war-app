import { ListThingsInThingGroupCommand } from '@aws-sdk/client-iot'
import type { Static } from '@sinclair/typebox'
import { useIoTClient } from 'api/hooks/useIoTClient'
import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient'
import { clearShadow } from 'api/persistence/clearShadow'
import { getShadow } from 'api/persistence/getShadow'
import { GameControllerShadow } from 'api/persistence/models/GameControllerShadow'
import { updateShadow } from 'api/persistence/updateShadow'
import { useCore } from 'hooks/useCore'
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
}>({
	report: () => undefined,
	reportDesired: () => undefined,
	reset: () => undefined,
	resetAdmin: () => undefined,
})

export const useGameControllerThing = () =>
	useContext(GameControllerThingContext)

export const GameControllerThingProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const {
		game: { gatewayReportDiscoveredRobots },
	} = useCore()
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

	const updateGatewayShadow =
		iotDataPlaneClient === undefined || thingName === undefined
			? undefined
			: updateShadow({
					iotDataPlaneClient,
					thingName,
					schema: GameControllerShadow,
			  })
	const getGatewayShadow =
		iotDataPlaneClient === undefined || thingName === undefined
			? undefined
			: getShadow({
					iotDataPlaneClient,
					thingName,
					schema: GameControllerShadow,
			  })
	const clearGatewayShadow =
		iotDataPlaneClient === undefined || thingName === undefined
			? undefined
			: clearShadow({
					iotDataPlaneClient,
					thingName,
			  })
	const clearAdminShadow =
		iotDataPlaneClient === undefined || thingName === undefined
			? undefined
			: clearShadow({
					iotDataPlaneClient,
					thingName,
					shadowName: 'admin',
			  })

	return (
		<GameControllerThingContext.Provider
			value={{
				thingName,
				reset: () => {
					clearGatewayShadow?.().catch(console.error)
				},
				resetAdmin: () => {
					clearAdminShadow?.().catch(console.error)
				},
				report: (robots) => {
					updateGatewayShadow?.({ reported: { robots } }).catch(console.error)
					gatewayReportDiscoveredRobots(robots)
				},
				reportDesired: () => {
					getGatewayShadow?.()
						.then((maybeShadow) => {
							if ('error' in maybeShadow) {
								console.error(maybeShadow)
								return
							}
							updateGatewayShadow?.({ reported: maybeShadow.desired }).catch(
								console.error,
							)
						})
						.catch(console.error)
				},
			}}
		>
			{children}
		</GameControllerThingContext.Provider>
	)
}
