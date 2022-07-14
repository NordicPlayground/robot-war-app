import type { Static } from '@sinclair/typebox'
import type { ReportedGameState } from 'api/validateGameControllerShadow'
import { gameEngine, GameEngine } from 'core/gameEngine.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

const defaultGame = gameEngine({
	field: {
		heightMm: 1000,
		widthMm: 1500,
	},
})

export const CoreContext = createContext<{
	game: GameEngine
	robots: Static<typeof ReportedGameState>['robots']
}>({
	game: defaultGame,
	robots: {},
})

export const useCore = () => useContext(CoreContext)

export const CoreProvider: FunctionComponent<{
	children: ReactNode
	game?: GameEngine
}> = ({ children, game }) => {
	const gameInstance = game ?? defaultGame

	// Maintain a copy of the robots for components
	const [robots, setRobots] = useState<ReturnType<GameEngine['robots']>>(
		gameInstance.robots(),
	)

	// Update the state that holds the robots
	gameInstance.onAll(({ name }) => {
		console.debug(`[core]`, name)
		setRobots(gameInstance.robots())
	})

	return (
		<CoreContext.Provider
			value={{
				game: gameInstance,
				robots,
			}}
		>
			{children}
		</CoreContext.Provider>
	)
}
