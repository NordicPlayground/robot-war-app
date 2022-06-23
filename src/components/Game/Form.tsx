import type { RobotCommand } from 'app/pages/Game'
import styles from 'components/Game/Form.module.css'
import { RobotConfig } from 'components/Game/RobotConfig'
import { FunctionComponent, useState } from 'react'

export const Form: FunctionComponent<{
	commands: RobotCommand[]
	onUpdateCommands: (updatedCommands: RobotCommand[]) => void
}> = ({ commands, onUpdateCommands }) => {
	const [nextRobotCommand, setNextRobotCommand] = useState<RobotCommand[]>([
		...commands,
	])

	return (
		<form>
			{nextRobotCommand
				.sort(({ robotMac: macA }, { robotMac: macB }) =>
					macA.localeCompare(macB),
				)
				.map((robot) => {
					const { robotMac, angleDeg, driveTimeMs } = robot
					return (
						<RobotConfig
							key={robotMac}
							id={robotMac}
							driveTimeMs={driveTimeMs}
							angleDeg={angleDeg}
							onUpdateAngleDeg={(angleDeg) =>
								setNextRobotCommand((robots) => {
									const robot = robots.find(
										(robot) => robot.robotMac === robotMac,
									) as RobotCommand
									return [
										...robots.filter(
											({ robotMac: robotId }) => robotId !== robotMac,
										),
										{
											...robot,
											angleDeg,
										},
									]
								})
							}
							onUpdateDriveTimeMs={(driveTimeMs) =>
								setNextRobotCommand((robots) => {
									const robot = robots.find(
										(robot) => robot.robotMac === robotMac,
									) as RobotCommand
									return [
										...robots.filter(
											({ robotMac: robotId }) => robotId !== robotMac,
										),
										{
											...robot,
											driveTimeMs,
										},
									]
								})
							}
						></RobotConfig>
					)
				})}
			<footer>
				<button
					className={styles.button1}
					type="button"
					onClick={() => {
						onUpdateCommands(nextRobotCommand)
					}}
				>
					save
				</button>
			</footer>
		</form>
	)
}
