import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useRef,
} from 'react'

const pressDetection = createContext<{
	startLongPressDetection: () => void
	endLongPressDetection: () => boolean
}>({
	startLongPressDetection: () => undefined,
	endLongPressDetection: () => false,
})

export const usePressDetection = () => useContext(pressDetection)

export const PressDetectionProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const longPressFlag = 1500 // is considered long press after 1500 milliseconds
	const timerRef: { current: NodeJS.Timeout | null } = useRef(null)
	const isLongPressRef = useRef(false)

	const startLongPressDetection = (): void => {
		isLongPressRef.current = false
		timerRef.current = setTimeout(() => {
			isLongPressRef.current = true
		}, longPressFlag)
	}

	const endLongPressDetection = (): boolean => {
		const isLongPressDetected = isLongPressRef.current
		clearTimeout(timerRef.current as NodeJS.Timeout)
		isLongPressRef.current = false
		return isLongPressDetected
	}

	return (
		<pressDetection.Provider
			value={{
				startLongPressDetection: () => startLongPressDetection(),
				endLongPressDetection: () => endLongPressDetection(),
			}}
		>
			{children}
		</pressDetection.Provider>
	)
}
