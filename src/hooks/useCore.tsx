import { gameEngine, GameEngine } from 'core/gameEngine.js'
import { useAppConfig } from 'hooks/useAppConfig.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useRef,
	useState,
} from 'react'

export const CoreContext = createContext<{
	game: GameEngine
	robots: ReturnType<GameEngine['robots']>
	teams: ReturnType<GameEngine['teams']>
}>({
	game: gameEngine({
		field: {
			heightMm: 1000,
			widthMm: 1500,
		},
	}),
	robots: {},
	teams: [],
})

export const useCore = () => useContext(CoreContext)

export const CoreProvider: FunctionComponent<{
	children: ReactNode
	game?: GameEngine
}> = ({ children, game }) => {
	const { fieldHeightMm, fieldWidthMm } = useAppConfig()
	const gameInstance = useRef<GameEngine>(
		game ??
			gameEngine({
				field: {
					heightMm: fieldHeightMm,
					widthMm: fieldWidthMm,
				},
			}),
	)

	// Maintain a copy of the robots for components
	const [robots, setRobots] = useState<ReturnType<GameEngine['robots']>>(
		gameInstance.current.robots(),
	)

	// Maintain a copy of the teams for components
	const [teams, setTeams] = useState<ReturnType<GameEngine['teams']>>(
		gameInstance.current.teams(),
	)

	// Update the state that holds the robots
	gameInstance.current.onAll(({ name }) => {
		console.debug(`[core]`, name)
		setRobots(gameInstance.current.robots())
		setTeams(gameInstance.current.teams())
	})

	return (
		<CoreContext.Provider
			value={{
				game: gameInstance.current,
				robots,
				teams,
			}}
		>
			{children}
		</CoreContext.Provider>
	)
}
