import { MutableRefObject, useRef } from 'react'

export const usePressTimer = (): [
	() => void,
	() => void,
	MutableRefObject<boolean>,
] => {
	const longPressFlag = 1500 // is considered long press after 1500 milliseconds
	const timerRef: { current: NodeJS.Timeout | null } = useRef(null)
	const isLongPressRef = useRef(false)

	const startTimer = (): void => {
		isLongPressRef.current = false
		timerRef.current = setTimeout(() => {
			isLongPressRef.current = true
		}, longPressFlag)
	}

	const stopTimer = (): void => {
		clearTimeout(timerRef.current as NodeJS.Timeout)
	}

	return [startTimer, stopTimer, isLongPressRef]
}
