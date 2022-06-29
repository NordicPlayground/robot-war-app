import { Static, Type } from '@sinclair/typebox'
import { MacAddress } from 'api/validateGameControllerShadow.js'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

export const TeamId = Type.String({
	minLength: 1,
})
const DistanceInMm = Type.Number({ minimum: 0, title: 'Distance in MM' })
const RotationDeg = Type.Number({
	minimum: -180,
	maximum: 180,
	title: 'Rotation in degrees',
})

export const Position = Type.Object(
	{
		xMm: DistanceInMm,
		yMm: DistanceInMm,
		rotationDeg: RotationDeg,
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
