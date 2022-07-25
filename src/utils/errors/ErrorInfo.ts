import type { NotFoundError } from 'utils/errors/NotFoundError.js'
import type { ValidationError } from 'utils/errors/ValidationError.js'

export type ErrorInfo = {
	error: ValidationError | NotFoundError
}
