import { Field } from 'components/Game/Field.js'
import { isolateComponent } from 'isolate-react'

describe('Field', () => {
	it('Should trigger onPointerMove', () => {
		const onPointerMove = jest.fn()

		const field = isolateComponent(
			<Field
				numberOfHelperLines={4}
				startZoneSizeMm={1}
				heightMm={100}
				widthMm={100}
				onPointerMove={onPointerMove}
			/>,
		)

		field.setRef(0, {
			getBoundingClientRect: jest.fn(() => ({
				top: 2,
				left: 2,
				width: 1,
				height: 1,
			})),
		})

		// Move pointer
		field.findOne('[data-test-id=field]').props.onPointerMove({
			stopPropagation: jest.fn(),
			clientX: 5,
			clientY: 5,
		})

		expect(onPointerMove).toHaveBeenCalledTimes(1)
		expect(onPointerMove).toHaveBeenCalledWith({ xMm: 300, yMm: 300 })
	})

	it('Should trigger onPointerUp when pointer is up', () => {
		const onPointerUp = jest.fn()

		const field = isolateComponent(
			<Field
				numberOfHelperLines={4}
				startZoneSizeMm={1}
				heightMm={100}
				widthMm={100}
				onPointerUp={onPointerUp}
			/>,
		)

		field.setRef(0, {
			getBoundingClientRect: jest.fn(() => ({
				top: 2,
				left: 2,
				width: 1,
				height: 1,
			})),
		})

		// Up pointer
		field.findOne('[data-test-id=field]').props.onPointerUp({
			stopPropagation: jest.fn(),
			clientX: 5,
			clientY: 5,
		})

		expect(onPointerUp).toHaveBeenCalledTimes(1)
		expect(onPointerUp).toHaveBeenCalledWith({ xMm: 300, yMm: 300 })
	})
})
