import style from 'app/pages/Game.module.css'
import { Field } from 'components/Game/Field'
import { Robot } from 'components/Game/Robot'
import { useGameAdmin } from 'hooks/useGameAdmin'
import { useState } from 'react'

const randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`

export const Admin = () => {
	const fieldWidthMm = 1500
	const fieldHeightMm = 1000
	const startZoneSizeMm = 100
	const robotWidthMM = 65
	const robotLengthMm = 90

	const [robots, setRobots] = useState<
		{
			id: string
			xMm: number
			yMm: number
			colorHex: string
			rotationDeg: number
		}[]
	>([])

	const {
		metaData: { robotTeamAssignment },
		setRobotPosition,
	} = useGameAdmin()
	const [count, setCount] = useState<number>(0)

	return (
		<div className={style.field}>
			<Field
				heightMm={fieldHeightMm}
				widthMm={fieldWidthMm}
				numberOfHelperLines={3}
				startZoneSizeMm={startZoneSizeMm}
				onClick={({ xMm, yMm }) => {
					if (count >= Object.keys(robotTeamAssignment).length) {
						return
					}
					//useGameAdmin().setRobotPosition(()=> )
					setRobots((robots) => [
						...robots,
						{
							xMm,
							yMm,
							id: Object.keys(robotTeamAssignment)[count],
							colorHex: randomColor(),
							rotationDeg: 0,
						},
					])
					count >= Object.keys(robotTeamAssignment).length
						? setCount(count)
						: setCount(count + 1)
					setRobotPosition(Object.keys(robotTeamAssignment)[count], {
						xMm,
						yMm,
					})
				}}
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
							// FIX: This function need to dissapear,
							setRobots((robots) => [
								...robots.filter(({ id: robotId }) => robotId !== id),
								{
									xMm,
									yMm,
									id,
									colorHex,
									rotationDeg: rotationDeg,
								},
							])
						}}
					/>
				))}
			</Field>
		</div>
	)
}
