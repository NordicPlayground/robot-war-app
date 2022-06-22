import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Form } from 'components/Game/Form'
import { Robot } from 'components/Game/Robot'
import { nanoid } from 'nanoid'
import React, { useState } from 'react'

const randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`

export type RobotState = {
	id: string
	xMm: number
	yMm: number
	colorHex: string
	executedCommands: ExecutedRobotCommand[]
}
//Lena trenger: id, drivetime, angle

export type RobotCommand = { id: string; angleDeg: number; driveTimeMs: number }

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

	console.log(robotCommands)
	return (
		<>
			<Form
				commands={robotCommands}
				onUpdateCommands={setRobotCommands}
				key={JSON.stringify(robotCommands)}
			/>
			<div className={style.field}>
				<Field
					heightMm={fieldHeightMm}
					widthMm={fieldWidthMm}
					numberOfHelperLines={3}
					startZoneSizeMm={startZoneSizeMm}
					onClick={({ xMm, yMm }) => {
						const id = nanoid()
						setRobots((robots) => [
							...robots,
							{
								id,
								xMm,
								yMm,
								colorHex: randomColor(),
								executedCommands: [],
							},
						])
						setRobotCommands((commands) => [
							...commands,
							{
								id,
								angleDeg: 0,
								driveTimeMs: 0,
							},
						])
					}}
				>
					{robots.map(({ xMm, yMm, id, colorHex, executedCommands }) => {
						const nextRobotCommand: RobotCommand = robotCommands.find(
							(robot) => id === robot.id,
						) ?? {
							id,
							angleDeg: 0,
							driveTimeMs: 0,
						}
						return (
							<Robot
								key={id}
								id={id}
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
										...commands.filter((cmd) => cmd.id !== id),
										nextRobotCommand,
									])
								}}
							/>
						)
					})}
				</Field>
			</div>
		</>
	)
}

const calculateExpectedRotation = (commands: RobotCommand[]): number =>
	commands.reduce((angle, { angleDeg }) => angle + angleDeg, 0)
