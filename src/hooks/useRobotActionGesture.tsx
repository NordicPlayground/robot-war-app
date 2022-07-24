import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

type Result = {
	rotationDeg: number
	driveTimeMs: number
}

export const RobotActionGesture = createContext<{
	start: (args: { x: number; y: number }) => void
	updateMousePosition: (args: { x: number; y: number }) => Result
	end: () => Result
}>({
	start: () => undefined,
	updateMousePosition: () => ({
		rotationDeg: 0,
		driveTimeMs: 0,
	}),
	end: () => ({
		rotationDeg: 0,
		driveTimeMs: 0,
	}),
})

export const useRobotActionGesture = () => useContext(RobotActionGesture)

type Position = [number, number]

const getDriveTime = (x: number, y: number) => {
	const xs = x * x
	const ys = y * y
	return Math.round(Math.min(1000, Math.sqrt(xs + ys) * 5)) // FIXME: convert to percentage
}

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
	const driveTime = getDriveTime(deltaX, deltaY)
	const rotation = getRotation(deltaX, deltaY)

	return {
		rotationDeg: rotation,
		driveTimeMs: driveTime,
	}
}

export const RobotActionProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [active, setIsActive] = useState<boolean>(false)
	const [start, setStartPosition] = useState<Position>([0, 0])
	const [current, setCurrentPosition] = useState<Position>([0, 0])

	return (
		<RobotActionGesture.Provider
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
		</RobotActionGesture.Provider>
	)
}
