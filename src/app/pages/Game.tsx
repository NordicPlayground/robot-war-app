import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { InputField } from 'components/Game/InputField'
import { Robot } from 'components/Game/Robot'
import { nanoid } from 'nanoid'
import React, { useState } from 'react'

const randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`

export const Game = () => {
	const fieldWidthMm = 1500
	const fieldHeightMm = 1000
	const startZoneSizeMm = 100
	const robotWidthMM = 60
	const robotLengthMm = 150

	const [robots, setRobots] = useState<
		{
			id: string
			xMm: number
			yMm: number
			colorHex: string
			rotationDeg: number
			drivetime: number
		}[]
	>([])
	console.log(robots)

	return (
		<div>
			<div className={style.field}>
				<Field
					heightMm={fieldHeightMm}
					widthMm={fieldWidthMm}
					numberOfHelperLines={3}
					startZoneSizeMm={startZoneSizeMm}
					onClick={({ xMm, yMm }) =>
						setRobots((robots) => [
							...robots,
							{
								xMm,
								yMm,
								id: nanoid(),
								colorHex: randomColor(),
								rotationDeg: 90,
								drivetime: 0,
							},
						])
					}
				>
					{robots.map(({ xMm, yMm, id, colorHex, rotationDeg }) => (
						<Robot
							key={id}
							id={id}
							xMm={xMm}
							yMm={yMm}
							widthMm={robotWidthMM}
							heightMm={robotLengthMm}
							colorHex={colorHex}
							rotationDeg={rotationDeg}
							onRotate={(rotation) => {
								setRobots((robots) => [
									...robots.filter(({ id: robotId }) => robotId !== id),
									{
										xMm,
										yMm,
										id,
										colorHex,
										rotationDeg: rotationDeg + rotation,
										drivetime: 0,
									},
								])
							}}
						/>
					))}
				</Field>
			</div>
			{robots.map(({ xMm, yMm, id, colorHex, rotationDeg }) => (
				<InputField
					key={id}
					id={id}
					onpress={(rotation, duration) => {
						setRobots((robots) => [
							...robots.filter(({ id: robotId }) => robotId !== id),
							{
								xMm,
								yMm,
								id,
								colorHex,
								rotationDeg: rotationDeg + rotation,
								drivetime: duration,
							},
						])
					}}
				></InputField>
			))}
		</div>
	)
}
