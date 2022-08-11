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
		game: {
			field,
			teamFight,
			teamSetRobotMovement,
			teamsFinishedConfiguringRobotsMovement,
		},
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
	const [fightUnlocked, setFightUnlocked] = useState<boolean>(false)

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

	// Set default movements
	useEffect(() => {
		if (selectedTeam === undefined) return
		setRobotMovements((movements) => {
			Object.entries(robots).forEach(([address, robot]) => {
				if (robot.team !== selectedTeam) return
				movements[address] = movements[address] ?? robot
			})
			return movements
		})
	}, [robots, selectedTeam])

	if (selectedTeam === undefined)
		return <SelectTeam teams={teams} onSelect={setSelectedTeam} />

	const teamIsReadyToPlay =
		teamsFinishedConfiguringRobotsMovement().includes(selectedTeam)

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
					<div className="form-check form-switch me-2">
						<input
							className="form-check-input"
							type="checkbox"
							id="unlockDelete"
							disabled={teamIsReadyToPlay}
							checked={fightUnlocked}
							onChange={({ target: { checked } }) => {
								setFightUnlocked(checked)
							}}
						/>
						<label className="form-check-label" htmlFor="unlockDelete">
							Enable to unlock fight button
						</label>
					</div>
					<button
						type="button"
						className="btn btn-danger"
						disabled={!fightUnlocked}
						onClick={() => {
							teamFight(selectedTeam)
							setFightUnlocked(false)
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
						onPointerUp={(position) => {
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
										if (robotBelongsToTeam && !teamIsReadyToPlay) {
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
				{!teamIsReadyToPlay && (
					<Form
						movements={robotMovements}
						onUpdate={setRobotMovements}
						key={JSON.stringify(robotMovements)}
						teamColor={teamColor(selectedTeam)}
					/>
				)}
			</div>
		</>
	)
}
