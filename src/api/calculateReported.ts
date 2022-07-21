import type { Static } from '@sinclair/typebox'
import type { DesiredGameState } from 'api/persistence/models/DesiredGameState.js'
import type { ReportedGameState } from 'api/persistence/models/ReportedGameState.js'
import type { RobotInGame } from 'core/models/RobotInGame.js'

export const calculateReported = ({
	robots,
	reported,
}: {
	reported: Static<typeof ReportedGameState>
	robots: Required<Static<typeof DesiredGameState>>['robots']
}): Static<typeof ReportedGameState> => {
	const reportedGameState: Static<typeof ReportedGameState> = {
		...reported,
	}

	for (const [robotMac, command] of Object.entries(robots)) {
		const updatedRobot: Static<typeof RobotInGame> = {
			...reported.robots[robotMac],
			angleDeg: command.angleDeg,
			driveTimeMs: command.driveTimeMs,
			revolutionCount: 0,
		}
		reportedGameState.robots = {
			...reportedGameState.robots,
			[robotMac]: updatedRobot,
		}
	}

	return reportedGameState
}
