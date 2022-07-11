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

export const CoreContext = createContext<GameEngine>(defaultGame)

export const useCore = () => useContext(CoreContext)

export const CoreProvider: FunctionComponent<{
	children: ReactNode
	game?: GameEngine
}> = ({ children, game }) => {
	const gameInstance = game ?? defaultGame

	// Maintain a copy of the robots for components
	const [gameState, setGameSate] = useState<{
		robots: ReturnType<GameEngine['robots']>
	}>({
		robots: gameInstance.robots(),
	})

	// Update the state that holds the robots
	gameInstance.onAll(({ name }) => {
		console.debug(`[core]`, name)
		setGameSate({
			robots: gameInstance.robots(),
		})
	})

	return (
		<CoreContext.Provider
			value={{
				...gameInstance,
				robots: () => gameState.robots,
			}}
		>
			{children}
		</CoreContext.Provider>
	)
}
