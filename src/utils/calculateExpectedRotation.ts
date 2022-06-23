import type { RobotCommand } from 'app/pages/Game'
import { shortestRotation } from 'utils/shortestRotation.js'

export const calculateExpectedRotation = (commands: RobotCommand[]): number =>
	shortestRotation(
		commands.reduce((angle, { angleDeg }) => angle + angleDeg, 0),
	)
