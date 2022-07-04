import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Form } from 'components/Game/Form'
import { Robot } from 'components/Game/Robot'
import { useGameAdmin } from 'hooks/useGameAdmin'
import { RobotCommand, useGameController } from 'hooks/useGameController'
import { useRobotActionGesture } from 'hooks/useRobotActionGesture'
import { useScrollBlock } from 'hooks/useScrollBlock'
import { useEffect, useState } from 'react'
import { helperLinesNumber } from 'utils/constants'
import { shortestRotation } from 'utils/shortestRotation'

const randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`

export const Game = () => {
	const fieldWidthMm = 1500
	const fieldHeightMm = 1000
	const startZoneSizeMm = 100
	const robotWidthMM = 65
	const robotLengthMm = 90

	const { gameState, setNextRoundCommands, nextRoundCommands } =
		useGameController()
	const {
		metaData: { robotFieldPosition },
	} = useGameAdmin()
	const {
		start: startRobotGesture,
		end: endRobotGesture,
		updateMousePosition,
	} = useRobotActionGesture()

	const [robotCommands, setRobotCommands] =
		useState<Record<string, RobotCommand>>(nextRoundCommands)

	useEffect(() => {
		setRobotCommands(nextRoundCommands)
	}, [nextRoundCommands])

	const updateRobotCommandFromGesture = ({
		mac,
		angleDeg,
		driveTimeMs,
	}: {
		mac: string
		angleDeg: number
		driveTimeMs: number
	}) => {
		const reportedAngle = robotFieldPosition[mac]?.rotationDeg ?? 0
		const nextRobotCommand: RobotCommand = robotCommands[mac] ?? {
			angleDeg: 0,
			driveTimeMs: 0,
		}
		setRobotCommands((commands) => ({
			...commands,
			[mac]: {
				...nextRobotCommand,
				angleDeg: shortestRotation(angleDeg - reportedAngle),
				driveTimeMs,
			},
		}))
	}

	const [blockScroll, allowScroll] = useScrollBlock()
	const [activeRobot, setActiveRobot] = useState<string>()
	const handleRobotGestureEnd = () => {
		if (activeRobot === undefined) return
		allowScroll()
		const { angleDeg, driveTimeMs } = endRobotGesture()
		updateRobotCommandFromGesture({ mac: activeRobot, angleDeg, driveTimeMs })
		setActiveRobot(undefined)
	}

	return (
		<>
			<div
				role={'presentation'}
				onPointerMove={(e) => {
					if (activeRobot === undefined) return
					updateRobotCommandFromGesture({
						mac: activeRobot,
						...updateMousePosition({
							x: e.clientX,
							y: e.clientY,
						}),
					})
				}}
				onPointerUp={handleRobotGestureEnd}
			>
				<div>
					<button
						type="button"
						className="btn btn-danger"
						onClick={() => {
							setNextRoundCommands(robotCommands)
						}}
					>
						Fight!
					</button>
				</div>
				<div className={style.field}>
					<Field
						heightMm={fieldHeightMm}
						widthMm={fieldWidthMm}
						numberOfHelperLines={helperLinesNumber}
						startZoneSizeMm={startZoneSizeMm}
						onClick={(position) => {
							console.debug(`User clicked on field at`, position)
						}}
					>
						{Object.values(gameState.robots).map(({ mac }) => {
							const nextRobotCommand: RobotCommand = robotCommands[mac] ?? {
								angleDeg: 0,
								driveTimeMs: 0,
							}

							const { rotationDeg, xMm, yMm } = robotFieldPosition[mac] ?? {
								rotationDeg: 0,
								xMm: 0,
								yMm: 0,
							}

							// FIXME: use fixed color per team
							const colorHex = randomColor()

							return (
								<Robot
									key={mac}
									id={mac}
									xMm={xMm}
									yMm={yMm}
									widthMm={robotWidthMM}
									heightMm={robotLengthMm}
									colorHex={colorHex}
									rotationDeg={rotationDeg}
									desiredRotationDeg={rotationDeg + nextRobotCommand.angleDeg}
									desiredDriveTime={nextRobotCommand.driveTimeMs}
									desiredDriveBudgetPercent={
										(nextRobotCommand.driveTimeMs ?? 0) / 1000
									}
									onRotate={(angleDeg) =>
										updateRobotCommandFromGesture({
											mac,
											angleDeg,
											driveTimeMs: nextRobotCommand.driveTimeMs,
										})
									}
									onPointerDown={(args) => {
										blockScroll()
										startRobotGesture({
											x: args.x,
											y: args.y,
										})
										setActiveRobot(mac)
									}}
									onPointerUp={handleRobotGestureEnd}
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
			</div>
		</>
	)
}
