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
import { usePressDetection } from 'hooks/usePressDetection'
import { useScrollBlock } from 'hooks/useScrollBlock'
import { useEffect, useState } from 'react'
import { shortestRotation360 } from 'utils/shortestRotation'
import { teamColor } from 'utils/teamColor.js'

export const Admin = () => {
	const { robotWidthMm, robotLengthMm, startZoneSizeMm, helperLinesNumber } =
		useAppConfig()
	const {
		robots,
		game: {
			field,
			adminSetRobotPosition,
			adminSetAllRobotPositions,
			adminNextRound,
			teamsFinishedConfiguringRobotsMovement,
			teams,
		},
	} = useCore()

	const [selectedRobot, setSelectedRobot] = useState<{
		mac: string | undefined
		action: string | undefined
	}>()
	const [blockScroll, allowScroll] = useScrollBlock()
	const [moveRobotsUnlocked, setMoveRobotsUnlocked] = useState<boolean>(false)
	const configuringRobotMovementInProgress =
		teamsFinishedConfiguringRobotsMovement().length !== teams().length
	const {
		start: startRobotGesture,
		end: endRobotGesture,
		updateMousePosition,
	} = useDragGesture()
	const { startLongPressDetection, endLongPressDetection } = usePressDetection()

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

	const handleRobotRotationEnd = () => {
		if (
			selectedRobot?.mac !== undefined &&
			selectedRobot?.action == 'rotation'
		) {
			const { rotationDeg } = endRobotGesture()
			adminSetRobotPosition(selectedRobot?.mac, {
				rotationDeg: shortestRotation360(rotationDeg),
			})
			setSelectedRobot({ mac: undefined, action: undefined })
			allowScroll()
		}
	}

	return (
		<div>
			<div>
				<div className="form-check form-switch me-2">
					<input
						className="form-check-input"
						type="checkbox"
						id="unlockMoveRobots"
						disabled={configuringRobotMovementInProgress}
						checked={moveRobotsUnlocked}
						onChange={({ target: { checked } }) => {
							setMoveRobotsUnlocked(checked)
						}}
					/>
					<label className="form-check-label" htmlFor="unlockMoveRobots">
						Enable Finished Moved Robots button
					</label>
				</div>
				<button
					type="button"
					className="btn btn-danger"
					disabled={!moveRobotsUnlocked}
					onClick={() => {
						setMoveRobotsUnlocked(false)
						adminNextRound()
						// admin next round should clear the teamsReady list
					}}
				>
					Finished Moving Robots
				</button>
			</div>
			<div
				className={style.field}
				onPointerMove={(e) => {
					if (selectedRobot?.mac === undefined) return
					if (selectedRobot?.action === 'rotation') {
						blockScroll()
						const { rotationDeg } = updateMousePosition({
							x: e.clientX,
							y: e.clientY,
						})

						adminSetRobotPosition(selectedRobot.mac, {
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
						if (selectedRobot?.mac !== undefined) {
							if (selectedRobot?.action === 'reposition') {
								adminSetRobotPosition(selectedRobot?.mac, {
									xMm,
									yMm,
								})
							}
							setSelectedRobot({ mac: undefined, action: undefined })
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
								selectedRobot?.mac !== undefined && selectedRobot.mac !== mac
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
								startLongPressDetection()
								blockScroll()
								startRobotGesture({
									x: args.x,
									y: args.y,
								})
							}}
							onPointerUp={() => {
								const isLongPressDetected = endLongPressDetection()

								isLongPressDetected
									? setSelectedRobot({ mac, action: 'reposition' })
									: setSelectedRobot({ mac, action: 'rotation' })
							}}
							onDoubleClick={() => {
								setSelectedRobot({ mac, action: 'reposition' })
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
