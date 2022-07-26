export class ValidationError extends Error {
	public readonly details
	constructor(title: string, details: Record<string, any>) {
		super(title)
		this.name = 'ValidationError'
		this.details = details
	}
}
