import { gameEvent2AdminStateUpdate } from 'api/persistence/gameEvent2AdminStateUpdate.js'
import type { GameEngineEvent } from 'core/gameEngine.js'
import { GameEngineEventType } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'

describe('gameEvent2AdminStateUpdate()', () => {
	describe('should convert a game engine event to an admin state update', () => {
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

		const robotPositionsSet: GameEngineEvent = {
			name: GameEngineEventType.robot_positions_set,
			positions: {
				'3A:FE:50:B8:D6:FE': {
					xMm: 1425,
					yMm: 125,
					rotationDeg: 270,
				},
				'34:7F:B3:65:24:4E': {
					xMm: 75,
					yMm: 125,
					rotationDeg: 90,
				},
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
			],
			[
				robotPositionSet,
				{
					robotFieldPosition: {
						[address]: {
							xMm: 17,
							yMm: 42,
						},
					},
				},
			],
			[
				robotRotationSet,
				{
					robotFieldPosition: {
						[address]: {
							rotationDeg: 42,
						},
					},
				},
			],
			[
				robotPositionsSet,
				{
					robotFieldPosition: {
						'3A:FE:50:B8:D6:FE': {
							xMm: 1425,
							yMm: 125,
							rotationDeg: 270,
						},
						'34:7F:B3:65:24:4E': {
							xMm: 75,
							yMm: 125,
							rotationDeg: 90,
						},
					},
				},
			],
		])('should convert a %s event', (event, expectedStatus) =>
			expect(gameEvent2AdminStateUpdate(event)).toEqual(expectedStatus),
		)
	})
})
