import { useIoTClient } from 'api/hooks/useIoTClient.js'
import { listGameControllerThings } from 'api/listGameControllerThings.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

export const GameControllerThingsContext = createContext<string[]>([])

export const useGameControllerThings = () =>
	useContext(GameControllerThingsContext)

export const GameControllerThingsProvider: FunctionComponent<{
	children: ReactNode
	useIotClientInjected?: typeof useIoTClient
}> = ({ children, useIotClientInjected }) => {
	const [gameControllerThings, setGameControllerThings] = useState<string[]>([])
	const iotClient = (useIotClientInjected ?? useIoTClient)()

	useEffect(() => {
		let mounted = true
		if (iotClient === undefined) return

		listGameControllerThings({ iotClient })()
			.then((things) => {
				if (!mounted) return
				console.debug(
					`[useGameControllerThings]`,
					'Found',
					things?.length ?? 0,
					'game controllers',
					things,
				)
				setGameControllerThings(things ?? [])
			})
			.catch((error) => {
				console.error(
					'[useGameControllerThings]',
					'Failed to list things in group. ',
				)
				console.error(error)
			})
		return () => {
			mounted = false
		}
	}, [iotClient])

	return (
		<GameControllerThingsContext.Provider value={gameControllerThings}>
			{children}
		</GameControllerThingsContext.Provider>
	)
}
