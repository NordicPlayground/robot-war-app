import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Form } from 'components/Game/Form'
import { Robot } from 'components/Game/Robot'
import { useGameAdmin } from 'hooks/useGameAdmin'
import { RobotCommand, useGameController } from 'hooks/useGameController'
import { useState } from 'react'
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

	// FIXME: retrieve robots in game from GameController
	const { gameState } = useGameController()
	//console.log(gameState.robots) // <- use this below
	const {
		metaData: { robotFieldPosition },
	} = useGameAdmin()

	console.log(robotFieldPosition)

	const [robotCommands, setRobotCommands] = useState<
		Record<string, RobotCommand>
	>({})
	const { nextRoundCommands } = useGameController()

	return (
		<>
			<div>
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => {
						nextRoundCommands(robotCommands)
					}}
				>
					Fight!
				</button>
			</div>
			<div className={style.field}>
				<Field
					heightMm={fieldHeightMm}
					widthMm={fieldWidthMm}
					numberOfHelperLines={3}
					startZoneSizeMm={startZoneSizeMm}
					onClick={(position) => {
						console.debug(`User clicked on field at`, position)
					}}
				>
					{Object.values(gameState.robots).map(({ mac, angleDeg }) => {
						const nextRobotCommand: RobotCommand = robotCommands[mac] ?? {
							angleDeg: 0,
							driveTimeMs: 0,
						}

						const { rotationDeg, xMm, yMm } = robotFieldPosition[mac]
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
								rotationDeg={rotationDeg + nextRobotCommand.angleDeg}
								onRotate={(rotation) => {
									setRobotCommands((commands) => ({
										...commands,
										[mac]: {
											...nextRobotCommand,
											angleDeg: shortestRotation(
												nextRobotCommand.angleDeg + rotation,
											),
										},
									}))
								}}
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
		</>
	)
}
