import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Form } from 'components/Game/Form'
import { Robot } from 'components/Game/Robot'
import { SelectTeam } from 'components/Team/SelectTeam'
import { useAppConfig } from 'hooks/useAppConfig'
import { useCore } from 'hooks/useCore'
import { useDragGesture } from 'hooks/useDragGesture'
import { useScrollBlock } from 'hooks/useScrollBlock'
import { useTeam } from 'hooks/useTeam'
import { useEffect, useState } from 'react'
import { distanceToDriveTime } from 'utils/distanceToDriveTime'
import { mirrorAngle } from 'utils/mirrorAngle'
import { shortestRotation } from 'utils/shortestRotation'
import { defaultColor, teamColor } from 'utils/teamColor'

export const Game = () => {
	const { robotWidthMm, robotLengthMm, startZoneSizeMm } = useAppConfig()
	const {
		robots,
		game: { field, teamFight, teamSetRobotMovement },
		teams,
	} = useCore()
	const { helperLinesNumber } = useAppConfig()
	const { selectedTeam, setSelectedTeam } = useTeam()
	const {
		start: startRobotGesture,
		end: endRobotGesture,
		updateMousePosition,
	} = useDragGesture()
	const [robotMovements, setRobotMovements] = useState<
		Record<
			string,
			{
				angleDeg: number
				driveTimeMs: number
			}
		>
	>({})

	const [blockScroll, allowScroll] = useScrollBlock()
	const [activeRobot, setActiveRobot] = useState<string>()

	const updateRobotCommandFromGesture = ({
		mac,
		rotationDeg,
		driveTimeMs,
	}: {
		mac: string
		rotationDeg: number
		driveTimeMs: number
	}) => {
		setRobotMovements((movements) => ({
			...movements,
			[mac]: {
				angleDeg: mirrorAngle(
					shortestRotation(
						rotationDeg - (robots[mac]?.position?.rotationDeg ?? 0),
					),
				),
				driveTimeMs,
			},
		}))
	}

	const handleRobotGestureEnd = () => {
		if (activeRobot === undefined) return
		allowScroll()
		const { rotationDeg, distancePx } = endRobotGesture()
		updateRobotCommandFromGesture({
			mac: activeRobot,
			rotationDeg,
			driveTimeMs: distanceToDriveTime(distancePx),
		})
		teamSetRobotMovement(activeRobot, {
			angleDeg: mirrorAngle(
				shortestRotation(
					rotationDeg - (robots[activeRobot]?.position?.rotationDeg ?? 0),
				),
			),
			driveTimeMs: distanceToDriveTime(distancePx),
		})
		setActiveRobot(undefined)
	}

	useEffect(() => {
		setRobotMovements((movements) => {
			Object.entries(robots).forEach(([address, robot]) => {
				movements[address] = movements[address] ?? robot
			})
			return movements
		})
	}, [robots])

	if (selectedTeam === undefined)
		return <SelectTeam teams={teams} onSelect={setSelectedTeam} />

	return (
		<>
			<div
				role={'presentation'}
				onPointerMove={(e) => {
					if (activeRobot === undefined) return
					const update = updateMousePosition({
						x: e.clientX,
						y: e.clientY,
					})
					updateRobotCommandFromGesture({
						mac: activeRobot,
						rotationDeg: update.rotationDeg,
						driveTimeMs: distanceToDriveTime(update.distancePx),
					})
				}}
				onPointerUp={handleRobotGestureEnd}
			>
				<div>
					<button
						type="button"
						className="btn btn-danger"
						onClick={() => {
							teamFight(selectedTeam)
						}}
					>
						Fight!
					</button>
				</div>
				<div className={style.field}>
					<Field
						heightMm={field.heightMm}
						widthMm={field.widthMm}
						numberOfHelperLines={helperLinesNumber}
						startZoneSizeMm={startZoneSizeMm}
						onClick={(position) => {
							console.debug(`User clicked on field at`, position)
						}}
					>
						{Object.entries(robots).map(([mac, robot]) => {
							const { xMm, yMm, rotationDeg } = robot.position ?? {}
							const robotBelongsToTeam = selectedTeam === robot.team
							if (
								xMm === undefined ||
								yMm === undefined ||
								rotationDeg === undefined
							)
								return null
							const movement = robotMovements[mac] as
								| {
										angleDeg: number
										driveTimeMs: number
								  }
								| undefined
							return (
								<Robot
									key={mac}
									id={mac}
									xMm={robot.position?.xMm ?? 0}
									yMm={yMm}
									widthMm={robotWidthMm}
									heightMm={robotLengthMm}
									colorHex={
										robotBelongsToTeam ? teamColor(robot.team) : defaultColor
									}
									rotationDeg={rotationDeg}
									angleDeg={movement?.angleDeg}
									driveTimeBudgetPercent={
										robotBelongsToTeam ? (movement?.driveTimeMs ?? 0) / 1000 : 0
									}
									outline={activeRobot !== undefined && activeRobot !== mac}
									onPointerDown={(args) => {
										if (robotBelongsToTeam) {
											setActiveRobot(mac)
											blockScroll()
											startRobotGesture({
												x: args.x,
												y: args.y,
											})
										}
									}}
									onPointerUp={() => {
										handleRobotGestureEnd()
										setActiveRobot(undefined)
									}}
								/>
							)
						})}
					</Field>
				</div>
				<Form
					movements={robotMovements}
					onUpdate={setRobotMovements}
					key={JSON.stringify(robotMovements)}
				/>
			</div>
		</>
	)
}
