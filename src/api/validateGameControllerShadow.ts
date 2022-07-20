import type { Static } from '@sinclair/typebox'
import { GameControllerShadow } from 'api/persistence/models/GameControllerShadow.js'
import {
	validateWithJSONSchema,
	ValidationError,
} from 'utils/validateWithJSONSchema.js'

/**
 * The default shadow for the Gateway contains the desired and report robot information.
 */
export const validateGameControllerShadow = (
	shadow: Record<string, any>,
):
	| Static<typeof GameControllerShadow>
	| {
			error: ValidationError
	  } => validateWithJSONSchema(GameControllerShadow)(shadow)
