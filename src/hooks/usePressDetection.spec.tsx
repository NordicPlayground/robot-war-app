/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react'
import {
	PressDetectionProvider,
	usePressDetection,
} from 'hooks/usePressDetection.js'

describe('usePressDetection', () => {
	it('Should detect short press', () => {
		/**
		 * Helper component to extract the hook functions from the rendered context
		 */
		const TestComponent = ({
			onRender,
		}: {
			onRender: (args: ReturnType<typeof usePressDetection>) => void
		}) => {
			onRender(usePressDetection())
			return null
		}

		// Capture hook functions
		let start: ReturnType<typeof usePressDetection>['startLongPressDetection']
		let end: ReturnType<typeof usePressDetection>['endLongPressDetection']

		// Render the component
		render(
			<PressDetectionProvider>
				<TestComponent
					onRender={({
						startLongPressDetection: startFn,
						endLongPressDetection: endFn,
					}) => {
						start = startFn
						end = endFn
					}}
				/>
			</PressDetectionProvider>,
		)

		// Start detection
		act(() => {
			start()
		})

		// End detection
		act(() => {
			expect(end()).toEqual(false)
		})
	})

	it('Should detect long press', () => {
		/**
		 * Helper component to extract the hook functions from the rendered context
		 */
		const TestComponent = ({
			onRender,
		}: {
			onRender: (args: ReturnType<typeof usePressDetection>) => void
		}) => {
			onRender(usePressDetection())
			return null
		}

		// Capture hook functions
		let start: ReturnType<typeof usePressDetection>['startLongPressDetection']
		let end: ReturnType<typeof usePressDetection>['endLongPressDetection']

		// Render the component
		render(
			<PressDetectionProvider>
				<TestComponent
					onRender={({
						startLongPressDetection: startFn,
						endLongPressDetection: endFn,
					}) => {
						start = startFn
						end = endFn
					}}
				/>
			</PressDetectionProvider>,
		)

		// Start detection
		act(() => {
			start()
		})

		// End detection after 3 seconds
		setTimeout(() => expect(end()).toEqual(true), 3000)
	})
})
