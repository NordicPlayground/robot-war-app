import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

import { getRotation } from 'utils/getRotation.js'

type Result = {
	rotationDeg: number
	distancePx: number
}

export const DragGesture = createContext<{
	start: (args: { x: number; y: number }) => void
	updateMousePosition: (args: { x: number; y: number }) => Result
	end: () => Result
}>({
	start: () => undefined,
	updateMousePosition: () => ({
		rotationDeg: 0,
		distancePx: 0,
	}),
	end: () => ({
		rotationDeg: 0,
		distancePx: 0,
	}),
})

export const useDragGesture = () => useContext(DragGesture)

type Position = [number, number]

/**
 * Subtract the x-coordinates and y-coordinates of one point from the other
 */
export const subtractCoordinates = (
	firstCoordinate: [number, number],
	secondCoordinate: [number, number],
): [number, number] => {
	const [x1, y1] = firstCoordinate
	const [x2, y2] = secondCoordinate
	return [x1 - x2, y1 - y2]
}

export const result = (start: [number, number], current: [number, number]) => {
	const [deltaX, deltaY] = subtractCoordinates(start, current)
	const rotation = getRotation(deltaX, deltaY)
	const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))

	return {
		rotationDeg: rotation,
		distancePx: distance,
	}
}

export const DragGestureProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [active, setIsActive] = useState<boolean>(false)
	const [start, setStartPosition] = useState<Position>([0, 0])
	const [current, setCurrentPosition] = useState<Position>([0, 0])

	return (
		<DragGesture.Provider
			value={{
				start: ({ x: xPosition, y: yPosition }) => {
					setStartPosition([xPosition, yPosition])
					setCurrentPosition([xPosition, yPosition])
					setIsActive(true)
				},
				updateMousePosition: ({ x: xPosition, y: yPosition }) => {
					if (!active) return result(start, [xPosition, yPosition])
					setCurrentPosition([xPosition, yPosition])
					return result(start, [xPosition, yPosition])
				},
				end: () => {
					setIsActive(false)
					return result(start, current)
				},
			}}
		>
			{children}
		</DragGesture.Provider>
	)
}
