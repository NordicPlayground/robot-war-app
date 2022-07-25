import type { Static } from '@sinclair/typebox'
import type { GameControllerShadow } from 'api/persistence/models/GameControllerShadow.js'
import { GameEngineEvent, GameEngineEventType } from 'core/gameEngine.js'

export const gameEvent2GatewayStateUpdate = (
	event: GameEngineEvent,
): Partial<Static<typeof GameControllerShadow>['desired']> | undefined => {
	switch (event.name) {
		case GameEngineEventType.robot_movement_set:
			return {
				[event.address]: {
					angleDeg: event.angleDeg,
					driveTimeMs: event.driveTimeMs,
				},
			}
	}
}
