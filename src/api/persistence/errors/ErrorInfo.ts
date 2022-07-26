import type { NotFoundError } from 'api/persistence/errors/NotFoundError.js'
import type { ValidationError } from 'api/persistence/errors/ValidationError.js'

export type ErrorInfo = {
	error: ValidationError | NotFoundError
}
