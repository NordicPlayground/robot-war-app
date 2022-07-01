import Color from 'color'
import styles from 'components/Game/Robot.module.css'
import { nanoid } from 'nanoid'

export const Robot = ({
	id,
	xMm,
	yMm,
	widthMm,
	heightMm,
	rotationDeg,
	desiredRotationDeg,
	desiredDriveBudgetPercent,
	colorHex,
	onRotate,
	onClick,
	outline,
	desiredDriveTime,
	onMouseDown,
	onMouseUp,
}: {
	id: string
	xMm: number
	yMm: number
	widthMm: number
	heightMm: number
	rotationDeg: number
	desiredRotationDeg?: number
	desiredDriveBudgetPercent?: number
	colorHex: string
	onRotate: (rotateDeg: number) => void
	onClick?: () => void
	onMouseDown?: (args: { x: number; y: number }) => void
	onMouseUp?: () => void
	outline?: boolean
	desiredDriveTime?: number
}) => {
	// Construct points for a triangle.
	const points: [number, number][] = []
	// First point centered tip
	points.push([xMm, yMm - heightMm / 2])
	// Left corner
	points.push([xMm - widthMm / 2, yMm + heightMm / 2])
	// Right corner
	points.push([xMm + widthMm / 2, yMm + heightMm / 2])

	// drive time
	const driveTimeLine: [number] = [xMm + widthMm / 2]
	driveTimeLine.push(yMm)
	driveTimeLine.push(xMm + widthMm / 2 + (desiredDriveTime ?? 0))
	driveTimeLine.push(yMm)

	const gradientId = nanoid()

	const getMouseCoordinates = (
		e: React.MouseEvent<SVGGElement, MouseEvent>,
	): {
		x: number
		y: number
	} => {
		return {
			x: e.clientX,
			y: e.clientY,
		}
	}

	return (
		<g
			onMouseDown={(e) => {
				e.stopPropagation()
				onMouseDown?.(getMouseCoordinates(e))
			}}
			onMouseUp={(e) => {
				e.stopPropagation()
				onMouseUp?.()
			}}
		>
			<defs>
				<linearGradient id={gradientId} gradientTransform="rotate(90)">
					<stop
						style={{
							stopColor: colorHex,
							stopOpacity: 1,
						}}
						offset={1}
					/>
					<stop
						style={{
							stopColor: Color(colorHex).darken(0.5).string(),
							stopOpacity: 1,
						}}
						offset={0}
					/>
				</linearGradient>
			</defs>
			{desiredRotationDeg !== undefined && (
				<g transform={`rotate(${desiredRotationDeg}, ${xMm}, ${yMm})`}>
					<path
						d={`M${xMm} ${yMm} L${xMm} ${
							yMm + widthMm * 4 * (desiredDriveBudgetPercent ?? 1)
						}`}
						style={{
							fill: `none`,
							stroke: 'green',
							strokeWidth: 4,
							strokeLinecap: 'butt',
							strokeLinejoin: 'miter',
							strokeOpacity: 1,
							strokeMiterlimit: 4,
							strokeDasharray: '4,4',
							strokeDashoffset: 0,
						}}
					/>
				</g>
			)}

			{desiredRotationDeg !== undefined && (
				<g transform={`rotate(${desiredRotationDeg}, ${xMm}, ${yMm})`}>
					<path
						d={`M${xMm} ${yMm} L${xMm} ${
							yMm + widthMm * 4 * (desiredDriveBudgetPercent ?? 1)
						}`}
						style={{
							fill: `none`,
							stroke: 'green',
							strokeWidth: 4,
							strokeLinecap: 'butt',
							strokeLinejoin: 'miter',
							strokeOpacity: 1,
							strokeMiterlimit: 4,
							strokeDasharray: '4,4',
							strokeDashoffset: 0,
						}}
					/>
				</g>
			)}
			<g transform={`rotate(${rotationDeg}, ${xMm}, ${yMm})`}>
				<polygon
					style={
						outline ?? false
							? {
									fill: `none`,
									stroke: colorHex,
									strokeWidth: 4,
							  }
							: {
									fill: `url(#${gradientId})`,
									fillOpacity: 1,
									stroke: 'none',
							  }
					}
					points={points.map((pointDef) => pointDef.join(',')).join(' ')}
					onWheel={(e) => {
						e.stopPropagation()
						onRotate(e.deltaY > 0 ? 5 : -5)
					}}
					onClick={(e) => {
						e.stopPropagation()
						onClick?.()
					}}
				/>
			</g>
			<text
				x={points[2][0] - widthMm / 2}
				y={points[2][1] - heightMm / 2}
				className={styles.label}
				dominantBaseline="middle"
				textAnchor="middle"
			>
				{id}
			</text>
		</g>
	)
}
