import type { Static } from '@sinclair/typebox'
import type { gameControllerAdminShadow } from 'api/validateGameAdminShadow'
import { GameEngineEvent, GameEngineEventType } from 'core/gameEngine.js'
import type { MacAddress } from 'core/models/MacAddress.js'
import type { RobotPosition } from 'core/models/RobotPosition.js'

export const gameEvent2StateUpdate = (
	event: GameEngineEvent,
):
	| Partial<{
			robotTeamAssignment: Static<
				typeof gameControllerAdminShadow
			>['state']['reported']['robotTeamAssignment']

			robotFieldPosition: Record<
				Static<typeof MacAddress>,
				Partial<Static<typeof RobotPosition>>
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
						rotationDeg: event.position.rotationDeg,
					},
				},
			}
	}
}