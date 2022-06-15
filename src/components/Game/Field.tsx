import React, { PropsWithChildren, useRef } from 'react'

export const Field = ({
	numberOfHelperLines,
	startZoneSizeMm,
	heightMm,
	widthMm,
	onClick,
	children,
}: PropsWithChildren<{
	numberOfHelperLines: number
	startZoneSizeMm: number
	heightMm: number
	widthMm: number
	onClick: (args: { xMm: number; yMm: number }) => void
}>) => {
	const svgRef = useRef<SVGSVGElement>(null)

	// Construct positions of helper lines
	const helperLines: number[] = []
	const interval = 1 / (numberOfHelperLines + 1)
	for (let i = interval; i < 1; i += interval) {
		helperLines.push(i)
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			viewBox={`0 0 ${widthMm} ${heightMm}`}
			height={heightMm}
			width={widthMm}
			style={{ height: 'auto', width: 'auto' }}
			onClick={(e) => {
				if (svgRef.current === null) return
				const box = svgRef.current.getBoundingClientRect()
				const relativeXPosition = (e.clientX - box.left) / box.width
				const relativeYPosition = (e.clientY - box.top) / box.height
				onClick({
					xMm: relativeXPosition * widthMm,
					yMm: relativeYPosition * heightMm,
				})
			}}
			ref={svgRef}
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
			{children}
		</svg>
	)
}
