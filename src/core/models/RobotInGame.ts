import { Type } from '@sinclair/typebox'
import { Robot } from 'core/models/Robot.js'

export const RobotInGame = Type.Intersect([
	Robot,
	Type.Object({
		revolutionCount: Type.Integer({
			minimum: 0,
		}),
	}),
])
