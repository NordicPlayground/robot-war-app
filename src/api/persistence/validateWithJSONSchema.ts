import type { Static, TSchema } from '@sinclair/typebox'
import Ajv from 'ajv'
import type { ErrorInfo } from 'api/persistence/errors/ErrorInfo.js'
import { ValidationError } from 'api/persistence/errors/ValidationError.js'

export const validateWithJSONSchema = <T extends TSchema>(
	schema: T,
): ((value: unknown) => ErrorInfo | Static<typeof schema>) => {
	const ajv = new Ajv()
	// see https://github.com/sinclairzx81/typebox/issues/51
	ajv.addKeyword('kind')
	ajv.addKeyword('modifier')
	const v = ajv.compile(schema)
	return (value: unknown) => {
		const valid = v(value)
		if (valid !== true) {
			return {
				error: new ValidationError('Validation failed!', {
					errors: v.errors,
					input: value,
				}),
			}
		}
		return value as Static<typeof schema>
	}
}
