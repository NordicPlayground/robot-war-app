import type { RobotCommand } from 'app/pages/Game'
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
				.sort(({ id: idA }, { id: idB }) => idA.localeCompare(idB))
				.map((robot) => {
					const { id, angleDeg, driveTimeMs } = robot
					return (
						<RobotConfig
							key={id}
							id={id}
							driveTimeMs={driveTimeMs}
							angleDeg={angleDeg}
							onUpdateAngleDeg={(angleDeg) =>
								setNextRobotCommand((robots) => {
									const robot = robots.find(
										(robot) => robot.id === id,
									) as RobotCommand
									return [
										...robots.filter(({ id: robotId }) => robotId !== id),
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
										(robot) => robot.id === id,
									) as RobotCommand
									return [
										...robots.filter(({ id: robotId }) => robotId !== id),
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
