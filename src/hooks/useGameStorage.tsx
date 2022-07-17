import { gameEvent2StateUpdate } from 'api/gameEvent2StateUpdate.js'
import type { PersistAdminChangeFn } from 'api/persistAdminChangeIoT.js'
import type { GameEngine, GameEngineEvent } from 'core/gameEngine.js'

/**
 * Persist changes to the game state to an AWS IoT Thing
 */

export const useGameStorage =
	(): ((args: {
		/**
		 * Observes the changes from the instance of the game
		 */
		game: GameEngine
		/**
		 * Writes the changes to this function
		 */
		persist: PersistAdminChangeFn
	}) => () => void) =>
	({ game: gameInstance, persist }) => {
		// Set up persisting of admin changes to the AWS IoT game controller thing
		console.log(`[useGameStorage]`, 'setting up connection')

		const eventHandler = async (event: GameEngineEvent) => {
			const update = gameEvent2StateUpdate(event)
			if (update !== undefined) {
				await persist(update)
			}
		}

		// Listen to all changesaddress
		gameInstance.onAll(eventHandler)

		return () => {
			console.log(`[useGameStorage]`, 'removing connection')
			gameInstance.offAll(eventHandler)
		}
	}
