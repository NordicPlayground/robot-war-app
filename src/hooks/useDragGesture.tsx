import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

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

const getRotation = (x: number, y: number) => {
	const rad = Math.atan2(y, x) // In radians
	const deg = rad * (180 / Math.PI) // In degrees
	return (
		(deg +
			180 + // Normalize to 360 degrees
			90) % // North is up
		360
	)
}

const result = (start: [number, number], current: [number, number]) => {
	const deltaX = start[0] - current[0]
	const deltaY = start[1] - current[1]
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
