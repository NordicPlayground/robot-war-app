import { Static, Type } from '@sinclair/typebox'
import { MacAddress } from 'core/models/MacAddress.js'
import { RobotPosition } from 'core/models/RobotPosition.js'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

export const TeamId = Type.String({
	minLength: 1,
})
export const gameControllerAdminShadow = Type.Object({
	state: Type.Object({
		reported: Type.Object({
			robotTeamAssignment: Type.Record(MacAddress, TeamId),
			robotFieldPosition: Type.Record(MacAddress, RobotPosition),
			robotConfiguration: Type.Optional(
				Type.Record(
					MacAddress,
					Type.Object({
						wheelCircumfenceMm: Type.Optional(
							Type.Integer({
								minimum: 0,
							}),
						),
					}),
				),
			),
		}),
	}),
})

/**
 * The named shadow "admin" contains metadata like the robot team assignment,
 * and position of thee robot on the field which the Gateway does not need to sync.
 */
export const validateGameControllerAdminShadow = (
	shadow: Record<string, any>,
):
	| Static<typeof gameControllerAdminShadow>
	| {
			error: ValidationError
	  } => validateWithJSONSchema(gameControllerAdminShadow)(shadow)
