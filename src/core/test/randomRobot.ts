import type { Static } from '@sinclair/typebox'
import type { ReportedRobot } from 'api/validateGameControllerShadow.js'

export const randomRobot = (): Static<typeof ReportedRobot> => ({
	angleDeg: 0,
	driveTimeMs: 0,
	revolutionCount: 0,
})
