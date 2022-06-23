import type { Static, TSchema } from '@sinclair/typebox'
import Ajv from 'ajv'

type ErrorInfo = {
	error: ValidationError
}

export class ValidationError extends Error {
	public readonly details
	constructor(title: string, details: Record<string, any>) {
		super(title)
		this.name = 'ValidationError'
		this.details = details
	}
}

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
