import { RobotConfig } from 'components/Game/RobotConfig'
import type { RobotCommand } from 'hooks/useGameController'
import type { FunctionComponent } from 'react'

export const Form: FunctionComponent<{
	commands: Record<string, RobotCommand>
	onUpdateCommands: (updatedCommands: Record<string, RobotCommand>) => void
}> = ({ commands, onUpdateCommands }) => (
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
