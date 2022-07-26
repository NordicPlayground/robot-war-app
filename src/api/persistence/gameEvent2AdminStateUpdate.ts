import type { Static } from '@sinclair/typebox'
import type { AdminShadowUpdate } from 'api/persistence/models/AdminShadow.js'
import { GameEngineEvent, GameEngineEventType } from 'core/gameEngine.js'

export const gameEvent2AdminStateUpdate = (
	event: GameEngineEvent,
): Static<typeof AdminShadowUpdate>['reported'] | undefined => {
	switch (event.name) {
		case GameEngineEventType.robot_team_assigned:
			return {
				robotTeamAssignment: {
					[event.address]: event.team,
				},
			}
		case GameEngineEventType.robot_positions_set:
			return {
				robotFieldPosition: event.positions,
			}
		case GameEngineEventType.robot_position_set:
			return {
				robotFieldPosition: {
					[event.address]: {
						xMm: event.position.xMm,
						yMm: event.position.yMm,
						rotationDeg: event.position.rotationDeg,
					},
				},
			}
	}
}
