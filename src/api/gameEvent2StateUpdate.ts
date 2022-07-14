import type { Static } from '@sinclair/typebox'
import type {
	gameControllerAdminShadow,
	Position,
} from 'api/validateGameAdminShadow'
import type { MacAddress } from 'api/validateGameControllerShadow'
import { GameEngineEvent, GameEngineEventType } from 'core/gameEngine.js'

export const gameEvent2StateUpdate = (
	event: GameEngineEvent,
):
	| Partial<{
			robotTeamAssignment: Static<
				typeof gameControllerAdminShadow
			>['state']['reported']['robotTeamAssignment']

			robotFieldPosition: Record<
				Static<typeof MacAddress>,
				Partial<Static<typeof Position>>
			>
	  }>
	| undefined => {
	switch (event.name) {
		case GameEngineEventType.robot_team_assigned:
			return {
				robotTeamAssignment: {
					[event.address]: event.team,
				},
			}
		case GameEngineEventType.robot_position_set:
			return {
				robotFieldPosition: {
					[event.address]: {
						xMm: event.position.xMm,
						yMm: event.position.yMm,
					},
				},
			}
		case GameEngineEventType.robot_rotation_set:
			return {
				robotFieldPosition: {
					[event.address]: {
						rotationDeg: event.position.rotationDeg,
					},
				},
			}
	}
}
