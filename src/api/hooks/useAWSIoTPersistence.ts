import { gameEvent2StateUpdate } from 'api/gameEvent2StateUpdate'
import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient.js'
import { persistAdminChangeIoT } from 'api/persistAdminChangeIoT.js'
import type { GameEngineEvent } from 'core/gameEngine'
import { useCore } from 'hooks/useCore.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { debounce } from 'lodash-es'
import { useEffect } from 'react'

export const useAWSIoTPersistence = (): void => {
	const { game } = useCore()
	const { thingName } = useGameControllerThing()
	const iotDataPlaneClient = useIoTDataPlaneClient()
	// FIXME: also load data useAWSIoTPersistenceRetrieval(), but refactor it to be used like connectStorage()

	useEffect(() => {
		if (thingName === undefined) return
		if (iotDataPlaneClient === undefined) return

		const debouncedPersist = debounce(async (update) => {
			console.log(`[useAWSIoTPersistence]`, 'persisting', update)
			await persistAdminChangeIoT({
				adminThingName: thingName,
				iotDataPlaneClient,
			})(update)
		}, 1000)
		// Set up persisting of admin changes to the AWS IoT game controller thing
		console.log(`[useAWSIoTPersistence]`, 'setting up connection')

		const eventHandler = async (event: GameEngineEvent) => {
			const update = gameEvent2StateUpdate(event)
			if (update !== undefined) {
				await debouncedPersist(update)
			}
		}

		// Listen to all changesaddress
		game.onAll(eventHandler)

		return () => {
			console.log(`[useAWSIoTPersistence]`, 'closing connection')
			game.offAll(eventHandler)
		}
	}, [game, thingName, iotDataPlaneClient])
}
