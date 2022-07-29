import type { Static } from '@sinclair/typebox'
import style from 'app/pages/Game.module.css'
import { RobotTeamAssigner } from 'components/Admin/RobotTeamAssigner'
import { Field } from 'components/Game/Field'
import { Robot } from 'components/Game/Robot'
import type { RobotPosition } from 'core/models/RobotPosition'
import equal from 'fast-deep-equal'
import { useAppConfig } from 'hooks/useAppConfig'
import { useCore } from 'hooks/useCore'
import { useDragGesture } from 'hooks/useDragGesture'
import { useScrollBlock } from 'hooks/useScrollBlock'
import { useEffect, useState } from 'react'
import { shortestRotation360 } from 'utils/shortestRotation'
import { teamColor } from 'utils/teamColor.js'

export const Admin = () => {
	const { robotWidthMm, robotLengthMm, startZoneSizeMm, helperLinesNumber } =
		useAppConfig()
	const {
		robots,
		game: { field, adminSetRobotPosition, adminSetAllRobotPositions },
	} = useCore()

	const [selectedRobot, setSelectedRobot] = useState<string>()
	const [action, setAction] = useState<string>()
	const [blockScroll, allowScroll] = useScrollBlock()
	const {
		start: startRobotGesture,
		end: endRobotGesture,
		updateMousePosition,
	} = useDragGesture()

	// Create inital positions and rotation on the map
	// Distribute robots alternating in start zones of teams
	useEffect(() => {
		const updates: Parameters<typeof adminSetAllRobotPositions>[0] = {}
		const macs = Object.keys(robots)
		for (let i = 0; i < macs.length; i++) {
			const mac = macs[i]
			const robot = robots[mac]
			const robotPosition = robot.position
			let xMm = robot.position?.xMm

			if (xMm === undefined) {
				if (i % 2 === 0) {
					// Right side
					xMm = field.widthMm - startZoneSizeMm / 2
				} else {
					// Left side
					xMm = startZoneSizeMm / 2
				}
			}
			let yMm = robot.position?.yMm
			if (yMm === undefined) {
				const step = field.heightMm / (macs.length / 2)
				yMm = step * (Math.floor(i / 2) + 0.5)
			}
			const positionOnField: Static<typeof RobotPosition> = {
				xMm: Math.round(xMm),
				yMm: Math.round(yMm),
				rotationDeg:
					robot.position?.rotationDeg ?? (xMm < field.widthMm / 2 ? 90 : 270),
			}
			if (!equal(robotPosition, positionOnField)) {
				updates[mac] = positionOnField
			}
		}
		if (Object.keys(updates).length > 0) adminSetAllRobotPositions(updates)
	}, [adminSetAllRobotPositions, robots, field, startZoneSizeMm])

	const robotRenderConfig = Object.entries(robots).map(([mac, robot]) => ({
		mac,
		xMm: robot.position?.xMm ?? Math.round(field.widthMm / 2),
		yMm: robot.position?.yMm ?? Math.round(field.heightMm / 2),
		colorHex: teamColor(robot.team),
		rotationDeg: robot.position?.rotationDeg ?? 0,
	}))

	/**
	 * Define the action the admin is going to execute over expecific robot
	 */
	const defineAction = (actionType: string, robotId: string) => {
		setAction(actionType)
		setSelectedRobot(robotId)
	}

	const resetAction = () => {
		setAction(undefined)
		setSelectedRobot(undefined)
	}

	const handleRobotRotationEnd = () => {
		const { rotationDeg } = endRobotGesture()
		if (selectedRobot !== undefined && action == 'rotation') {
			adminSetRobotPosition(selectedRobot, {
				rotationDeg: shortestRotation360(rotationDeg),
			})
			resetAction()
			allowScroll()
		}
	}

	return (
		<div>
			<div
				className={style.field}
				onPointerMove={(e) => {
					if (selectedRobot === undefined) return
					if (action === 'rotation') {
						const { rotationDeg } = updateMousePosition({
							x: e.clientX,
							y: e.clientY,
						})

						adminSetRobotPosition(selectedRobot, {
							rotationDeg: shortestRotation360(rotationDeg),
						})
					}
				}}
				onPointerUp={handleRobotRotationEnd}
			>
				<Field
					heightMm={field.heightMm}
					widthMm={field.widthMm}
					numberOfHelperLines={helperLinesNumber}
					startZoneSizeMm={startZoneSizeMm}
					onPointerUp={({ xMm, yMm }) => {
						if (selectedRobot !== undefined) {
							if (action === 'reposition') {
								adminSetRobotPosition(selectedRobot, {
									xMm,
									yMm,
								})
							}
							resetAction()
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
									rotationDeg: shortestRotation360(rotationDeg + rotation),
								})
							}}
							onPointerDown={(args) => {
								blockScroll()
								defineAction('rotation', mac)
								startRobotGesture({
									x: args.x,
									y: args.y,
								})
							}}
							onDoubleClick={() => {
								defineAction('reposition', mac)
							}}
							onPointerEnter={() => {
								blockScroll()
							}}
							onPointerLeave={() => {
								allowScroll()
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
