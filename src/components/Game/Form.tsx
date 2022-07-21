import { RobotConfig } from 'components/Game/RobotConfig'
import type { FunctionComponent } from 'react'

export const Form: FunctionComponent<{
	movements: Record<string, { angleDeg: number; driveTimeMs: number }>
	onUpdate: (
		updatedCommands: Record<string, { angleDeg: number; driveTimeMs: number }>,
	) => void
}> = ({ movements: commands, onUpdate: onUpdateCommands }) => (
	<form>
		{Object.entries(commands)
			.sort(([macA], [macB]) => macA.localeCompare(macB))
			.map(([robotMac, { angleDeg, driveTimeMs }]) => (
				<RobotConfig
					key={robotMac}
					id={robotMac}
					driveTimeMs={driveTimeMs}
					angleDeg={angleDeg}
					onUpdateAngleDeg={(angleDeg) =>
						onUpdateCommands({
							...commands,
							[robotMac]: {
								...commands[robotMac],
								angleDeg,
							},
						})
					}
					onUpdateDriveTimeMs={(driveTimeMs) =>
						onUpdateCommands({
							...commands,
							[robotMac]: {
								...commands[robotMac],
								driveTimeMs,
							},
						})
					}
				></RobotConfig>
			))}
	</form>
)
