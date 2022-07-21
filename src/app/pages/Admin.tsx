import type { Static } from '@sinclair/typebox'
import style from 'app/pages/Game.module.css'
import { RobotTeamAssigner } from 'components/Admin/RobotTeamAssigner'
import { Field } from 'components/Game/Field'
import { Robot } from 'components/Game/Robot'
import type { RobotPosition } from 'core/models/RobotPosition'
import equal from 'fast-deep-equal'
import { useAppConfig } from 'hooks/useAppConfig'
import { useCore } from 'hooks/useCore'
import { useEffect, useState } from 'react'
import { teamColor } from 'utils/teamColor.js'

export const Admin = () => {
	const { robotWidthMm, robotLengthMm, startZoneSizeMm, helperLinesNumber } =
		useAppConfig()
	const {
		robots,
		game: { field, adminSetRobotPosition, adminSetAllRobotPositions },
	} = useCore()

	const [selectedRobot, setSelectedRobot] = useState<string>()

	// Create inital positions and rotation on the map
	useEffect(() => {
		const updates: Parameters<typeof adminSetAllRobotPositions>[0] = {}
		for (const [mac, robot] of Object.entries(robots)) {
			const robotPosition = robot.position
			const xMm =
				robot.position?.xMm ?? Math.round(Math.random() * field.widthMm)
			const yMm =
				robot.position?.yMm ?? Math.round(Math.random() * field.heightMm)
			const positionOnField: Static<typeof RobotPosition> = {
				xMm,
				yMm,
				rotationDeg:
					robot.position?.rotationDeg ?? (xMm < field.widthMm / 2 ? 90 : 270),
			}
			if (!equal(robotPosition, positionOnField)) {
				updates[mac] = positionOnField
			}
		}
		if (Object.keys(updates).length > 0) adminSetAllRobotPositions(updates)
	}, [adminSetAllRobotPositions, robots, field])

	const robotRenderConfig = Object.entries(robots).map(([mac, robot]) => ({
		mac,
		xMm: robot.position?.xMm ?? Math.round(field.widthMm / 2),
		yMm: robot.position?.yMm ?? Math.round(field.heightMm / 2),
		colorHex: teamColor(robot.team),
		rotationDeg: robot.position?.rotationDeg ?? 0,
	}))

	return (
		<div>
			<div className={style.field}>
				<Field
					heightMm={field.heightMm}
					widthMm={field.widthMm}
					numberOfHelperLines={helperLinesNumber}
					startZoneSizeMm={startZoneSizeMm}
					onClick={({ xMm, yMm }) => {
						if (selectedRobot !== undefined) {
							setSelectedRobot(undefined)
							adminSetRobotPosition(selectedRobot, {
								xMm,
								yMm,
							})
						}
					}}
				>
					{robotRenderConfig.map(({ mac, xMm, yMm, colorHex, rotationDeg }) => (
						<Robot
							key={mac}
							id={mac}
							xMm={xMm}
							yMm={yMm}
							widthMm={robotWidthMm}
							heightMm={robotLengthMm}
							colorHex={colorHex}
							outline={
								selectedRobot !== undefined && selectedRobot !== mac
									? true
									: false
							}
							rotationDeg={rotationDeg}
							onRotate={(rotation) => {
								adminSetRobotPosition(mac, {
									rotationDeg: rotationDeg + rotation,
								})
							}}
							onClick={() => {
								setSelectedRobot(mac)
							}}
						/>
					))}
				</Field>
				<form
					onSubmit={(e) => {
						e.preventDefault()
					}}
				></form>
			</div>
			<div>
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
			</div>
			<RobotTeamAssigner />
		</div>
	)
}
