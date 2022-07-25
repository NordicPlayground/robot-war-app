import { gameEvent2GatewayStateUpdate } from 'api/persistence/gameEvent2GatewayStateUpdate.js'
import type { GameEngineEvent } from 'core/gameEngine.js'
import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'

describe('gameEvent2GatewayStateUpdate()', () => {
	describe('should convert a game engine event to a gateway state update', () => {
		const address = randomMac()

		const robotMovementSet: GameEngineEvent = {
			address,
			name: GameEngineEventType.robot_movement_set,
			angleDeg: 46,
			driveTimeMs: 500,
		}

		it.each([
			[
				robotMovementSet,
				{
					[address]: {
						angleDeg: 46,
						driveTimeMs: 500,
					},
				},
			],
		])('should convert a %s event', (event, expectedStatus) =>
			expect(gameEvent2GatewayStateUpdate(event)).toEqual(expectedStatus),
		)
	})
})
