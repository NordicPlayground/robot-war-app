import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Form } from 'components/Game/Form'
import { Robot } from 'components/Game/Robot'
import { SelectTeam } from 'components/Team/SelectTeam'
import { useAppConfig } from 'hooks/useAppConfig'
import { useCore } from 'hooks/useCore'
import { useRobotActionGesture } from 'hooks/useRobotActionGesture'
import { useScrollBlock } from 'hooks/useScrollBlock'
import { useTeam } from 'hooks/useTeam'
import { useState } from 'react'
import { teamColor } from 'utils/teamColor'

export const Game = () => {
	const { robotWidthMm, robotLengthMm, startZoneSizeMm } = useAppConfig()
	const {
		robots,
		game: { field, teamFight, teamSetRobotMovement },
	} = useCore()
	const { helperLinesNumber } = useAppConfig()
	const { selectedTeam } = useTeam()
	const {
		start: startRobotGesture,
		end: endRobotGesture,
		updateMousePosition,
	} = useRobotActionGesture()
	const [robotMovements, setRobotMovements] = useState<
		Record<
			string,
			{
				angleDeg: number
				driveTimeMs: number
			}
		>
	>({})

	const [selectedRobot, setSelectedRobot] = useState<string>()
	const [blockScroll, allowScroll] = useScrollBlock()
	const [activeRobot, setActiveRobot] = useState<string>()

	const updateRobotCommandFromGesture = ({
		mac,
		angleDeg,
		driveTimeMs,
	}: {
		mac: string
		angleDeg: number
		driveTimeMs: number
	}) => {
		setRobotMovements((movements) => ({
			...movements,
			[mac]: {
				angleDeg,
				driveTimeMs,
			},
		}))
	}

	const handleRobotGestureEnd = () => {
		if (activeRobot === undefined) return
		allowScroll()
		const { angleDeg, driveTimeMs } = endRobotGesture()
		updateRobotCommandFromGesture({ mac: activeRobot, angleDeg, driveTimeMs })
		teamSetRobotMovement(activeRobot, { angleDeg, driveTimeMs })
		setActiveRobot(undefined)
	}

	if (selectedTeam === undefined) return <SelectTeam />

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
							const isSameTeam = selectedTeam === robot.team
							if (
								xMm === undefined ||
								yMm === undefined ||
								rotationDeg === undefined
							)
								return null
							const movement = robotMovements[mac]
							return (
								<Robot
									key={mac}
									id={mac}
									xMm={robot.position?.xMm ?? 0}
									yMm={yMm}
									widthMm={robotWidthMm}
									heightMm={robotLengthMm}
									colorHex={teamColor(robot.team)}
									rotationDeg={rotationDeg}
									desiredRotationDeg={rotationDeg + movement.angleDeg}
									desiredDriveTime={movement.driveTimeMs}
									desiredDriveBudgetPercent={
										isSameTeam ? (movement.driveTimeMs ?? 0) / 1000 : 0
									}
									outline={
										selectedRobot !== undefined &&
										selectedRobot !== mac &&
										isSameTeam
											? true
											: false
									}
									onPointerDown={(args) => {
										setSelectedRobot(mac)
										if (isSameTeam) {
											blockScroll()
											startRobotGesture({
												x: args.x,
												y: args.y,
											})
											setActiveRobot(mac)
										}
									}}
									onRotate={() => {
										console.log('onRotate')
									}}
									onPointerUp={() => {
										handleRobotGestureEnd()
										setSelectedRobot(undefined)
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
