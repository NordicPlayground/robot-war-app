import { Type } from '@sinclair/typebox'
import { Robot } from 'core/models/Robot.js'
import { RobotPosition } from 'core/models/RobotPosition.js'
import { TeamId } from 'core/models/TeamId.js'

export const RobotInGame = Type.Intersect([
	Robot,
	Type.Object({
		revolutionCount: Type.Integer({
			minimum: 0,
		}),
		team: Type.Optional(TeamId),
		position: Type.Optional(RobotPosition),
	}),
])
