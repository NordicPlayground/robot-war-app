import { useGameController } from 'hooks/useGameController'

export const GameControllers = () => {
	const { gameState } = useGameController()
	return <div>{JSON.stringify(gameState)}</div>
}
