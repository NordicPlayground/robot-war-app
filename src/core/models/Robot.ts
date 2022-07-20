import { Type } from '@sinclair/typebox'

export const Robot = Type.Object({
	angleDeg: Type.Integer({
		minimum: -180,
		maximum: 180,
	}),
	driveTimeMs: Type.Integer({
		minimum: 0,
		maximum: 60 * 1000,
	}),
})
