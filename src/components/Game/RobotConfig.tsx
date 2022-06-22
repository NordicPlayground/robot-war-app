import { useState } from 'react'

export const RobotConfig = ({
	id,
	angleDeg,
	driveTimeMs,
	onUpdateAngleDeg,
	onUpdateDriveTimeMs,
	maxDriveTimeMs,
}: {
	id: string
	angleDeg: number
	driveTimeMs: number
	onUpdateAngleDeg: (angleDeg: number) => void
	onUpdateDriveTimeMs: (driveTimeMs: number) => void
	maxDriveTimeMs?: number
}) => {
	const [angleInput, setAngleInput] = useState<string>(angleDeg.toString())
	const [driveTimeInput, setDriveTimeInput] = useState<string>(
		driveTimeMs.toString(),
	)
	return (
		<fieldset>
			<legend>robot {id}</legend>
			<div>
				<label htmlFor="angle">
					Angle in degree (relative to the driving direction of the robot)
				</label>
				<input
					type="number"
					placeholder="Angle in degree"
					width={50}
					height={30}
					value={angleInput}
					onChange={(e) => setAngleInput(e.target.value)}
					onBlur={() => {
						const angleDeg = Math.max(
							-180,
							Math.min(180, parseInt(angleInput, 10)),
						)
						if (isNaN(angleDeg)) {
							onUpdateAngleDeg(0)
							setAngleInput('0')
						} else {
							onUpdateAngleDeg(angleDeg)
							setAngleInput(angleDeg.toString())
						}
					}}
					min="-180"
					max="180"
					step={1}
					id="angle"
				></input>
			</div>
			<div>
				<label htmlFor="driveTime">Drive time in milliseconds</label>
				<input
					type="number"
					placeholder="Drive time in milliseconds"
					width={50}
					height={30}
					min="0"
					step={20}
					max={maxDriveTimeMs ?? 1000}
					value={driveTimeInput}
					onChange={(e) => setDriveTimeInput(e.target.value)}
					onBlur={() => {
						const driveTimeMs = Math.max(
							0,
							Math.min(maxDriveTimeMs ?? 1000, parseInt(driveTimeInput, 10)),
						)
						if (isNaN(driveTimeMs)) {
							onUpdateDriveTimeMs(0)
							setDriveTimeInput('0')
						} else {
							onUpdateDriveTimeMs(driveTimeMs)
							setDriveTimeInput(driveTimeMs.toString())
						}
					}}
					id="driveTime"
				></input>
			</div>
		</fieldset>
	)
}
