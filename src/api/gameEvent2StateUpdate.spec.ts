import { gameEvent2StateUpdate } from 'api/gameEvent2StateUpdate.js'
import type { GameEngineEvent } from 'core/gameEngine.js'
import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'

describe('gameEvent2StateUpdate()', () => {
	describe('should convert a game engine event to a state update', () => {
		const address = randomMac()

		const robotTeamAssigned: GameEngineEvent = {
			address,
			name: GameEngineEventType.robot_team_assigned,
			team: 'Team A',
		}

		const robotPositionSet: GameEngineEvent = {
			address,
			name: GameEngineEventType.robot_position_set,
			position: {
				xMm: 17,
				yMm: 42,
			},
		}

		const robotRotationSet: GameEngineEvent = {
			address,
			name: GameEngineEventType.robot_position_set,
			position: {
				rotationDeg: 42,
			},
		}

		it.each([
			[
				robotTeamAssigned,
				{
					robotTeamAssignment: {
						[address]: 'Team A',
					},
				},
				robotPositionSet,
				{
					robotFieldPosition: {
						[address]: {
							xMm: 17,
							yMm: 42,
						},
					},
				},
				robotRotationSet,
				{
					robotFieldPosition: {
						[address]: {
							rotationDeg: 42,
						},
					},
				},
			],
		])('should convert a %s event', (event, expectedStatus) =>
			expect(gameEvent2StateUpdate(event)).toEqual(expectedStatus),
		)
	})
})
