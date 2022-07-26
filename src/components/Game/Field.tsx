import { PropsWithChildren, useRef } from 'react'

export const Field = ({
	numberOfHelperLines,
	startZoneSizeMm,
	heightMm,
	widthMm,
	onClick,
	children,
	onPointerMove,
	onPointerUp,
}: PropsWithChildren<{
	numberOfHelperLines: number
	startZoneSizeMm: number
	heightMm: number
	widthMm: number
	onClick?: (args: { xMm: number; yMm: number }) => void
	onPointerMove?: (args: { xMm: number; yMm: number }) => void
	onPointerUp?: (args: { xMm: number; yMm: number }) => void
}>) => {
	const rectRef = useRef<SVGRectElement>(null)

	// Construct positions of helper lines
	const helperLines: number[] = []
	const interval = 1 / (numberOfHelperLines + 1)
	for (let i = interval; i < 1; i += interval) {
		helperLines.push(i)
	}

	const getMouseCoordinates = (
		ref: SVGRectElement,
		e: React.MouseEvent<SVGRectElement, MouseEvent>,
	): {
		xMm: number
		yMm: number
	} => {
		const box = ref.getBoundingClientRect()
		const relativeXPosition = (e.clientX - box.left) / box.width
		const relativeYPosition = (e.clientY - box.top) / box.height
		return {
			xMm: Math.round(relativeXPosition * widthMm),
			yMm: Math.round(relativeYPosition * heightMm),
		}
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			viewBox={`0 0 ${widthMm} ${heightMm}`}
			height={heightMm}
			width={widthMm}
		>
			{/* Start zone A */}
			<rect
				style={{
					strokeWidth: 1,
					fill: '#e3ffeb',
					stroke: 'none',
				}}
				y="0"
				x="0"
				height={heightMm}
				width={startZoneSizeMm}
			/>
			{/* Start zone B */}
			<rect
				style={{
					strokeWidth: 1,
					fill: '#e3ffeb',
					stroke: 'none',
				}}
				y="0"
				x={widthMm - startZoneSizeMm}
				height={heightMm}
				width={startZoneSizeMm}
			/>
			{helperLines.map((position) => (
				<g key={position}>
					<path
						d={`M ${widthMm * position},0 V ${heightMm}`}
						style={{
							fill: 'green',
							stroke: '#009100',
							strokeWidth: 1,
							strokeLinecap: 'butt',
							strokeLinejoin: 'miter',
							strokeOpacity: 1,
							strokeMiterlimit: 4,
							strokeDasharray: '4,4',
							strokeDashoffset: 0,
						}}
					/>
					<path
						d={`M 0,${heightMm * position} H ${widthMm}`}
						style={{
							fill: 'green',
							stroke: '#009100',
							strokeWidth: 1,
							strokeLinecap: 'butt',
							strokeLinejoin: 'miter',
							strokeOpacity: 1,
							strokeMiterlimit: 4,
							strokeDasharray: '4,4',
							strokeDashoffset: 0,
						}}
					/>
				</g>
			))}
			{/* Border */}
			<rect
				style={{
					strokeWidth: 1,
					fill: 'none',
					stroke: '#000000',
					strokeOpacity: 1,
					strokeMiterlimit: 4,
					strokeDasharray: 'none',
				}}
				y="0"
				x="0"
				height={heightMm}
				width={widthMm}
			/>
			{/* Click target */}
			<rect
				data-test-id="field"
				ref={rectRef}
				style={{
					fill: '#ffffff',
					opacity: 0,
					stroke: 'none',
				}}
				y="0"
				x="0"
				height={heightMm}
				width={widthMm}
				onClick={(e) => {
					if (rectRef.current === null) return
					onClick?.(getMouseCoordinates(rectRef.current, e))
				}}
				onPointerMove={(e) => {
					if (rectRef.current === null) return
					onPointerMove?.(getMouseCoordinates(rectRef.current, e))
				}}
				onPointerUp={(e) => {
					if (rectRef.current === null) return
					onPointerUp?.(getMouseCoordinates(rectRef.current, e))
				}}
			/>
			{children}
		</svg>
	)
}
