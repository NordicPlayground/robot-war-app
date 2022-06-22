import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Form } from 'components/Game/Form'
import { Robot } from 'components/Game/Robot'
import { useGameController } from 'hooks/useGameController'
import { nanoid } from 'nanoid'
import { useState } from 'react'

const randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`

export type RobotState = {
	mac: string
	xMm: number
	yMm: number
	colorHex: string
	executedCommands: ExecutedRobotCommand[]
}

export type RobotCommand = {
	robotMac: string
	angleDeg: number
	driveTimeMs: number
}

type ExecutedRobotCommand = RobotCommand & {
	success: boolean
	/* Unix timestamp in milliseconds */
	tsMs: number
}

export type Robots = RobotState[]

export const Game = () => {
	const fieldWidthMm = 1500
	const fieldHeightMm = 1000
	const startZoneSizeMm = 100
	const robotWidthMM = 90
	const robotLengthMm = 65

	const [robots, setRobots] = useState<Robots>([])
	const [robotCommands, setRobotCommands] = useState<RobotCommand[]>([])
	const { nextRoundCommands } = useGameController()

	return (
		<>
			<div>
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => {
						nextRoundCommands(robotCommands)
					}}
				>
					Fight!
				</button>
			</div>
			<div className={style.field}>
				<Field
					heightMm={fieldHeightMm}
					widthMm={fieldWidthMm}
					numberOfHelperLines={3}
					startZoneSizeMm={startZoneSizeMm}
					onClick={({ xMm, yMm }) => {
						const mac = nanoid()
						setRobots((robots) => [
							...robots,
							{
								mac,
								xMm,
								yMm,
								colorHex: randomColor(),
								executedCommands: [],
							},
						])
						setRobotCommands((commands) => [
							...commands,
							{
								robotMac: mac,
								angleDeg: 0,
								driveTimeMs: 0,
							},
						])
					}}
				>
					{robots.map(({ xMm, yMm, mac, colorHex, executedCommands }) => {
						const nextRobotCommand: RobotCommand = robotCommands.find(
							(robot) => mac === robot.robotMac,
						) ?? {
							robotMac: mac,
							angleDeg: 0,
							driveTimeMs: 0,
						}
						return (
							<Robot
								key={mac}
								id={mac}
								xMm={xMm}
								yMm={yMm}
								widthMm={robotWidthMM}
								heightMm={robotLengthMm}
								colorHex={colorHex}
								rotationDeg={calculateExpectedRotation([
									...executedCommands,
									nextRobotCommand,
								])}
								onRotate={(rotation) => {
									nextRobotCommand.angleDeg += rotation
									if (nextRobotCommand.angleDeg >= 180)
										nextRobotCommand.angleDeg =
											((nextRobotCommand.angleDeg + 180) % 360) - 180
									if (nextRobotCommand.angleDeg <= -180)
										nextRobotCommand.angleDeg =
											((nextRobotCommand.angleDeg - 180) % 360) + 180
									setRobotCommands((commands) => [
										...commands.filter((cmd) => cmd.robotMac !== mac),
										nextRobotCommand,
									])
								}}
							/>
						)
					})}
				</Field>
			</div>
			<Form
				commands={robotCommands}
				onUpdateCommands={setRobotCommands}
				key={JSON.stringify(robotCommands)}
			/>
		</>
	)
}

const calculateExpectedRotation = (commands: RobotCommand[]): number =>
	commands.reduce((angle, { angleDeg }) => angle + angleDeg, 0)
