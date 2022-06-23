import { Static, Type } from '@sinclair/typebox'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

const reportedGameState = Type.Object({
	round: Type.Integer({
		minimum: 0,
	}),
	robots: Type.Array(
		Type.Object({
			mac: Type.String({
				minLength: 16,
				title: 'A MAC address',
				examples: ['00:25:96:FF:FE:12:34:56'],
			}),
			angleDeg: Type.Integer({
				minimum: -180,
				maximum: 180,
			}),
			driveTimeMs: Type.Integer({
				minimum: 0,
				maximum: 60 * 1000,
			}),
			revolutionCount: Type.Optional(
				Type.Integer({
					minimum: 0,
				}),
			),
		}),
	),
})

export const gameControllerShadow = Type.Object({
	state: Type.Object({
		desired: Type.Optional(reportedGameState),
		reported: reportedGameState,
	}),
})

const validate = validateWithJSONSchema(gameControllerShadow)

export const validateGameControllerShadow = (
	shadow: Record<string, any>,
):
	| Static<typeof gameControllerShadow>
	| {
			error: ValidationError
	  } => validate(shadow)
