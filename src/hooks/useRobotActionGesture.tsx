import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'
import { shortestRotation } from 'utils/shortestRotation'

type Result = {
	angleDeg: number
	driveTimeMs: number
}

export const RobotActionGesture = createContext<{
	start: (args: { x: number; y: number }) => void
	updateMousePosition: (args: { x: number; y: number }) => Result
	end: () => Result
}>({
	start: () => undefined,
	updateMousePosition: () => ({
		angleDeg: 0,
		driveTimeMs: 0,
	}),
	end: () => ({
		angleDeg: 0,
		driveTimeMs: 0,
	}),
})

export const useRobotActionGesture = () => useContext(RobotActionGesture)

type Position = [number, number]

const result = (start: [number, number], current: [number, number]) => {
	const deltaX = start[0] - current[0]
	const deltaY = start[1] - current[1]
	const rad = Math.atan2(deltaY, deltaX) // In radians
	const deg = rad * (180 / Math.PI) // In degrees

	// calculate drive time
	let xs = deltaX
	xs = xs * xs

	let ys = deltaY
	ys = ys * ys

	return {
		angleDeg: shortestRotation(deg - 90), // 0 degree is north
		driveTimeMs: Math.round(Math.min(1000, Math.sqrt(xs + ys) * 5)), // FIXME: convert to percentage
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
