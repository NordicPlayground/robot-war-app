import type { Static } from '@sinclair/typebox'
import type { RobotInGame } from 'core/models/RobotInGame.js'

export const randomRobot = (): Static<typeof RobotInGame> => ({
	angleDeg: 0,
	driveTimeMs: 0,
	revolutionCount: 0,
})
