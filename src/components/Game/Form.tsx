import styles from 'components/Game/Form.module.css'
import { RobotConfig } from 'components/Game/RobotConfig'
import type { RobotCommand } from 'hooks/useGameController'
import { FunctionComponent, useState } from 'react'

export const Form: FunctionComponent<{
	commands: Record<string, RobotCommand>
	onUpdateCommands: (updatedCommands: Record<string, RobotCommand>) => void
}> = ({ commands, onUpdateCommands }) => {
	const [nextRobotCommands, setNextRobotCommands] = useState<
		Record<string, RobotCommand>
	>({
		...commands,
	})

	return (
		<form>
			{Object.entries(nextRobotCommands)
				.sort(([macA], [macB]) => macA.localeCompare(macB))
				.map(([robotMac, { angleDeg, driveTimeMs }]) => (
					<RobotConfig
						key={robotMac}
						id={robotMac}
						driveTimeMs={driveTimeMs}
						angleDeg={angleDeg}
						onUpdateAngleDeg={(angleDeg) =>
							setNextRobotCommands((commands) => ({
								...commands,
								[robotMac]: {
									...commands[robotMac],
									angleDeg,
								},
							}))
						}
						onUpdateDriveTimeMs={(driveTimeMs) =>
							setNextRobotCommands((commands) => ({
								...commands,
								[robotMac]: {
									...commands[robotMac],
									driveTimeMs,
								},
							}))
						}
					></RobotConfig>
				))}
			<footer>
				<button
					className={styles.button1}
					type="button"
					onClick={() => {
						onUpdateCommands(nextRobotCommands)
					}}
				>
					save
				</button>
			</footer>
		</form>
	)
}
