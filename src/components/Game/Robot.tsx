import Color from 'color'
import styles from 'components/Game/Robot.module.css'
import { nanoid } from 'nanoid'

const getMouseCoordinates = (
	e: React.MouseEvent<SVGGElement, MouseEvent>,
): {
	x: number
	y: number
} => ({
	x: e.clientX,
	y: e.clientY,
})

export const Robot = ({
	id,
	xMm,
	yMm,
	widthMm,
	heightMm,
	rotationDeg,
	angleDeg,
	driveTimeBudgetPercent,
	colorHex,
	onRotate,
	outline,
	onPointerDown,
	onPointerUp,
	onPointerEnter,
	onPointerLeave,
	onDoubleClick,
}: {
	id: string
	xMm: number
	yMm: number
	widthMm: number
	heightMm: number
	rotationDeg: number
	angleDeg?: number
	driveTimeBudgetPercent?: number
	colorHex: string
	onRotate?: (rotateDeg: number) => void
	onPointerDown?: (args: { x: number; y: number }) => void
	onDoubleClick?: (args: { x: number; y: number }) => void
	onPointerUp?: () => void
	outline?: boolean
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}) => {
	// Construct points for a triangle.
	const points: [number, number][] = []
	// First point centered tip
	points.push([xMm, yMm - heightMm / 2])
	// Left corner
	points.push([xMm - widthMm / 2, yMm + heightMm / 2])
	// Right corner
	points.push([xMm + widthMm / 2, yMm + heightMm / 2])

	const gradientId = nanoid()

	return (
		<g
			data-test-id="robot"
			onPointerDown={(e) => {
				e.stopPropagation()
				onPointerDown?.(getMouseCoordinates(e))
			}}
			onPointerUp={(e) => {
				e.stopPropagation()
				onPointerUp?.()
			}}
			onPointerEnter={(e) => {
				e.stopPropagation()
				onPointerEnter?.()
			}}
			onPointerLeave={(e) => {
				e.stopPropagation()
				onPointerLeave?.()
			}}
			onDoubleClick={(e) => {
				e.stopPropagation()
				onDoubleClick?.(getMouseCoordinates(e))
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
			{angleDeg !== undefined && (
				<g transform={`rotate(${rotationDeg + angleDeg}, ${xMm}, ${yMm})`}>
					<path
						d={`M${xMm} ${yMm} L${xMm} ${
							yMm - widthMm * 4 * (driveTimeBudgetPercent ?? 1)
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
					data-test-id="rotation-handle"
					style={{
						fill: '#FF0000',
						stroke: colorHex,
						strokeWidth: 4,
						opacity: 0,
					}}
					points={points.map((pointDef) => pointDef.join(',')).join(' ')}
					onWheel={(e) => {
						e.stopPropagation()
						onRotate?.(e.deltaY > 0 ? 5 : -5)
					}}
				/>
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
					onWheel={(e) => {
						e.stopPropagation()
						onRotate?.(e.deltaY > 0 ? 5 : -5)
					}}
					points={points.map((pointDef) => pointDef.join(',')).join(' ')}
					data-test-id="triangle"
				/>
			</g>
			<text
				x={points[2][0] - widthMm / 2}
				y={points[2][1] - heightMm / 2}
				className={styles.label}
				dominantBaseline="middle"
				textAnchor="middle"
				data-test-id="label"
			>
				{id}
			</text>
		</g>
	)
}
