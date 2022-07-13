import type { Static } from '@sinclair/typebox'
import type {
	gameControllerAdminShadow,
	Position,
} from 'api/validateGameAdminShadow'
import type { MacAddress } from 'api/validateGameControllerShadow'
import { GameEngine, GameEngineEventType } from 'core/gameEngine.js'

export type PersistAdminChangeFn = (
	update: Partial<{
		robotTeamAssignment: Static<
			typeof gameControllerAdminShadow
		>['state']['reported']['robotTeamAssignment']

		robotFieldPosition: Record<
			Static<typeof MacAddress>,
			Partial<Static<typeof Position>>
		>
	}>,
) => Promise<void>

/**
 * This maps robot_team_assigned event to an update JSON object
 */
export const persistAdminChanges = async ({
	persist,
	game,
}: {
	game: GameEngine
	persist: PersistAdminChangeFn
}): Promise<void> => {
	game.onAll(async (event) => {
		switch (event.name) {
			case GameEngineEventType.robot_team_assigned:
				await persist({
					robotTeamAssignment: {
						[event.address]: event.team,
					},
				}).catch(console.error)
				break
			case GameEngineEventType.robot_position_set:
				await persist({
					robotFieldPosition: {
						[event.address]: {
							xMm: event.position.xMm,
							yMm: event.position.yMm,
						},
					},
				}).catch(console.error)
				break
			case GameEngineEventType.robot_rotation_set:
				await persist({
					robotFieldPosition: {
						[event.address]: {
							rotationDeg: event.position.rotationDeg,
						},
					},
				})
				break
		}
	})
}
