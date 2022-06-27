import { Static, Type } from '@sinclair/typebox'
import { MacAddress } from 'api/validateGameControllerShadow.js'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

export const TeamId = Type.String({
	minLength: 1,
})
const DistanceInMm = Type.Integer({ minimum: 0, title: 'Distance in MM' })

export const Position = Type.Object(
	{
		xMm: DistanceInMm,
		yMm: DistanceInMm,
	},
	{ title: 'Position on the field' },
)

export const gameControllerAdminShadow = Type.Object({
	state: Type.Object({
		reported: Type.Object({
			robotTeamAssignment: Type.Record(MacAddress, TeamId),
			robotFieldPosition: Type.Record(MacAddress, Position),
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
