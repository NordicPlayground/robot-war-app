export class NotFoundError extends Error {
	public readonly details
	constructor(title: string, details?: Record<string, any>) {
		super(title)
		this.name = 'NotFoundError'
		this.details = details
	}
}
