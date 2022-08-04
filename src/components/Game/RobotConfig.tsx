import { Main } from 'components/Main'
import { useState } from 'react'

export const RobotConfig = ({
	id,
	angleDeg,
	driveTimeMs,
	onUpdateAngleDeg,
	onUpdateDriveTimeMs,
	maxDriveTimeMs,
	teamColor,
	readyToPlay,
}: {
	id: string
	angleDeg: number
	driveTimeMs: number
	onUpdateAngleDeg: (angleDeg: number) => void
	onUpdateDriveTimeMs: (driveTimeMs: number) => void
	maxDriveTimeMs?: number
	teamColor: string
	readyToPlay: boolean
}) => {
	const [angleInput, setAngleInput] = useState<string>(angleDeg.toString())
	const [driveTimeInput, setDriveTimeInput] = useState<string>(
		driveTimeMs.toString(),
	)
	return (
		<Main>
			<div className="card">
				<div
					className="card-header"
					style={{
						backgroundColor: teamColor,
					}}
				>
					Robot {id}
				</div>
				<div className="card-body">
					<fieldset className="mt-1">
						<div className="mt-1">
							<label htmlFor="autoUpdateInterval" className="form-label">
								Angle:
							</label>
							<div className="input-group">
								<input
									type="number"
									placeholder="Angle in degree"
									width={30}
									height={30}
									value={angleInput}
									disabled={!readyToPlay}
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
									className="form-control"
								/>
								<span
									className="input-group-text"
									id="autoUpdateInterval-addon"
								>
									Degrees
								</span>
							</div>
						</div>
					</fieldset>

					<fieldset className="mt-1">
						<div className="mt-1">
							<label htmlFor="autoUpdateInterval" className="form-label">
								Drive time:
							</label>
							<div className="input-group">
								<input
									type="number"
									placeholder="Drive time in milliseconds"
									width={50}
									height={30}
									min="0"
									step={20}
									max={maxDriveTimeMs ?? 1000}
									value={driveTimeInput}
									disabled={!readyToPlay}
									onChange={(e) => setDriveTimeInput(e.target.value)}
									onBlur={() => {
										const driveTimeMs = Math.max(
											0,
											Math.min(
												maxDriveTimeMs ?? 1000,
												parseInt(driveTimeInput, 10),
											),
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
									className="form-control"
								/>
								<span
									className="input-group-text"
									id="autoUpdateInterval-addon"
								>
									milliseconds
								</span>
							</div>
						</div>
					</fieldset>
				</div>
			</div>
		</Main>
	)
}
