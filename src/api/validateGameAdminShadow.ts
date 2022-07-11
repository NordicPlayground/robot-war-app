import { Static, Type } from '@sinclair/typebox'
import { MacAddress } from 'api/validateGameControllerShadow.js'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

export const TeamId = Type.String({
	minLength: 1,
})
export const Position = Type.Object(
	{
		xMm: Type.Integer({
			minimum: 0,
			title:
				'X-Position (top to bottom) on the field in mm from the top left corner',
		}),
		yMm: Type.Integer({
			minimum: 0,
			title:
				'Y-Position (left to right) on the field in mm from the top left corner',
		}),
		rotationDeg: Type.Number({
			minimum: 0,
			maximum: 359,
			title:
				'Rotation in degrees, 0 facing North on the field, 90 facing east, 180 facing south, 270 facing west',
		}),
	},
	{ title: 'Position on the field' },
)

export const gameControllerAdminShadow = Type.Object({
	state: Type.Object({
		reported: Type.Object({
			robotTeamAssignment: Type.Record(MacAddress, TeamId),
			robotFieldPosition: Type.Record(MacAddress, Position),
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
