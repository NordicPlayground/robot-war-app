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
	robots: ReturnType<GameEngine['robots']>
	teams: ReturnType<GameEngine['teams']>
}>({
	game: defaultGame,
	robots: {},
	teams: [],
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

	// Maintain a copy of the teams for components
	const [teams, setTeams] = useState<ReturnType<GameEngine['teams']>>(
		gameInstance.teams(),
	)

	// Update the state that holds the robots
	gameInstance.onAll(({ name }) => {
		console.debug(`[core]`, name)
		setRobots(gameInstance.robots())
		setTeams(gameInstance.teams)
	})

	return (
		<CoreContext.Provider
			value={{
				game: gameInstance,
				robots,
				teams,
			}}
		>
			{children}
		</CoreContext.Provider>
	)
}
