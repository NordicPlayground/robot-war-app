import { RobotConfig } from 'components/Game/RobotConfig'
import type { FunctionComponent } from 'react'

export const Form: FunctionComponent<{
	movements: Record<string, { angleDeg: number; driveTimeMs: number }>
	onUpdate: (
		updatedCommands: Record<string, { angleDeg: number; driveTimeMs: number }>,
	) => void
	teamColor: string
	readyToPlay: boolean
}> = ({ movements, onUpdate: onUpdateCommands, teamColor, readyToPlay }) => (
	<form>
		{Object.entries(movements)
			.sort(([macA], [macB]) => macA.localeCompare(macB))
			.map(([robotMac, { angleDeg, driveTimeMs }]) => (
				<RobotConfig
					key={robotMac}
					id={robotMac}
					driveTimeMs={driveTimeMs}
					angleDeg={angleDeg}
					onUpdateAngleDeg={(angleDeg) =>
						onUpdateCommands({
							...movements,
							[robotMac]: {
								...movements[robotMac],
								angleDeg,
							},
						})
					}
					onUpdateDriveTimeMs={(driveTimeMs) =>
						onUpdateCommands({
							...movements,
							[robotMac]: {
								...movements[robotMac],
								driveTimeMs,
							},
						})
					}
					teamColor={teamColor}
					readyToPlay
				></RobotConfig>
			))}
	</form>
)
