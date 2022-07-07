import { Static, Type } from '@sinclair/typebox'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

export const Robot = Type.Object({
	angleDeg: Type.Number({
		minimum: -180,
		maximum: 180,
	}),
	driveTimeMs: Type.Number({
		minimum: 0,
		maximum: 60 * 1000,
	}),
})

export const ReportedRobot = Type.Intersect([
	Robot,
	Type.Object({
		revolutionCount: Type.Integer({
			minimum: 0,
		}),
	}),
])

export const DesiredRobot = Robot

export const MacAddress = Type.String({
	minLength: 16,
	title: 'A MAC address',
	examples: ['00:25:96:FF:FE:12:34:56'],
})

export const ReportedGameState = Type.Object({
	robots: Type.Record(MacAddress, ReportedRobot),
})

export const DesiredGameState = Type.Object({
	robots: Type.Optional(Type.Record(MacAddress, DesiredRobot)),
})

export const gameControllerShadow = Type.Object({
	state: Type.Object({
		desired: Type.Optional(DesiredGameState),
		reported: ReportedGameState,
	}),
})

/**
 * The default shadow for the Gateway contains the desired and report robot information.
 */
export const validateGameControllerShadow = (
	shadow: Record<string, any>,
):
	| Static<typeof gameControllerShadow>
	| {
			error: ValidationError
	  } => validateWithJSONSchema(gameControllerShadow)(shadow)
