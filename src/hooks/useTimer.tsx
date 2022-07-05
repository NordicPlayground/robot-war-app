import { useEffect, useState } from 'react'

export const useTimer = (): [number, (seconds: number) => void, () => void] => {
	const [seconds, setSeconds] = useState(0)
	const [isActive, setIsActive] = useState(false)

	function start(seconds: number) {
		setIsActive(true)
		setSeconds(seconds)
	}

	function reset() {
		setSeconds(0)
		setIsActive(false)
	}

	useEffect(() => {
		let interval: NodeJS.Timer | undefined = undefined
		if (isActive) {
			interval = setInterval(() => {
				setSeconds((seconds) => seconds - 1)
			}, 1000)
		} else if (seconds === 0) {
			clearInterval(interval)
		}
		return () => clearInterval(interval)
	}, [isActive, seconds])

	return [seconds, start, reset]
}
