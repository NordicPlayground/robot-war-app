import style from 'app/pages/Game.module.css'
import { TeamAssigner } from 'components/Admin/TeamAssigner'
import { Field } from 'components/Game/Field'
import { Robot } from 'components/Game/Robot'
import { useGameAdmin } from 'hooks/useGameAdmin'
import { useGameController } from 'hooks/useGameController'
import { useEffect, useState } from 'react'

const randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`

type RobotFieldConfig = Record<
	string,
	{
		xMm: number
		yMm: number
		colorHex: string
		rotationDeg: number
	}
>

export const Admin = () => {
	const fieldWidthMm = 1500
	const fieldHeightMm = 1000
	const startZoneSizeMm = 100
	const robotWidthMM = 65
	const robotLengthMm = 90

	const {
		metaData: { robotFieldPosition, robotTeamAssignment },
		setRobotPosition,
	} = useGameAdmin()

	const { gameState } = useGameController()

	const [robots, setRobots] = useState<RobotFieldConfig>({})
	const [selectedRobot, setSelectedRobot] = useState<string>()

	useEffect(() => {
		const defaultRobotConfig: RobotFieldConfig = {}
		for (const reportedRobot of Object.values(gameState.robots)) {
			defaultRobotConfig[reportedRobot.mac] = {
				xMm:
					robotFieldPosition[reportedRobot.mac]?.xMm ??
					Math.random() * fieldWidthMm,
				yMm:
					robotFieldPosition[reportedRobot.mac]?.yMm ??
					Math.random() * fieldHeightMm,
				colorHex: randomColor(),
				rotationDeg:
					(reportedRobot.angleDeg ?? 0) +
					(robotFieldPosition[reportedRobot.mac]?.rotationDeg ?? 0),
			}
		}
		setRobots(defaultRobotConfig)
	}, [gameState, robotFieldPosition])

	return (
		<div>
			<div className={style.field}>
				<Field
					heightMm={fieldHeightMm}
					widthMm={fieldWidthMm}
					numberOfHelperLines={3}
					startZoneSizeMm={startZoneSizeMm}
					onClick={({ xMm, yMm }) => {
						if (selectedRobot !== undefined) {
							setSelectedRobot(undefined)
							setRobots((robots) => ({
								...robots,
								[selectedRobot]: {
									...robots[selectedRobot],
									xMm,
									yMm,
								},
							}))
							setRobotPosition(selectedRobot, {
								xMm,
								yMm,
								rotationDeg: robots[selectedRobot].rotationDeg,
							})
						}
					}}
				>
					{Object.entries(robots).map(
						([mac, { xMm, yMm, colorHex, rotationDeg }]) => (
							<Robot
								key={mac}
								id={mac}
								xMm={xMm}
								yMm={yMm}
								widthMm={robotWidthMM}
								heightMm={robotLengthMm}
								colorHex={colorHex}
								outline={
									selectedRobot !== undefined && selectedRobot !== mac
										? true
										: false
								}
								rotationDeg={rotationDeg}
								onRotate={(rotation) => {
									setRobots((robots) => ({
										...robots,
										[mac]: {
											...robots[mac],
											rotationDeg: rotationDeg + rotation,
										},
									}))
									setRobotPosition(mac, {
										xMm: robots[mac].xMm,
										yMm: robots[mac].yMm,
										rotationDeg: rotationDeg + rotation,
									})
								}}
								onClick={() => {
									setSelectedRobot(mac)
								}}
							/>
						),
					)}
				</Field>
				<form
					onSubmit={(e) => {
						e.preventDefault()
					}}
				>
					<button
						className="btn btn-secondary"
						type="button"
						disabled={selectedRobot === undefined}
						onClick={() => {
							setSelectedRobot(undefined)
						}}
					>
						cancel
					</button>
				</form>
			</div>
			<div>
				<TeamAssigner />
			</div>
		</div>
	)
}
