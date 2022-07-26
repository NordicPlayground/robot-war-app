import { Field } from 'components/Game/Field.js'
import { isolateComponent } from 'isolate-react'

describe('Field', () => {
	it('should call onClick method when field have been clicked', () => {
		const onClick = jest.fn()
		const onPointerMove = jest.fn()
		const onPointerUp = jest.fn()

		const field = isolateComponent(
			<Field
				numberOfHelperLines={4}
				startZoneSizeMm={1}
				heightMm={100}
				widthMm={100}
				onClick={onClick}
				onPointerMove={onPointerMove}
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

		// Click on field
		field.findOne('[data-test-id=field]').props.onClick({
			stopPropagation: jest.fn(),
			clientX: 3,
			clientY: 3,
		})

		expect(onClick).toHaveBeenCalledTimes(1)
		expect(onClick).toHaveBeenCalledWith({ xMm: 100, yMm: 100 })
	})

	it('Should trigger onPointerMove when pointer is move after on click', () => {
		const onClick = jest.fn()
		const onPointerMove = jest.fn()
		const onPointerUp = jest.fn()

		const field = isolateComponent(
			<Field
				numberOfHelperLines={4}
				startZoneSizeMm={1}
				heightMm={100}
				widthMm={100}
				onClick={onClick}
				onPointerMove={onPointerMove}
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

		// Click on field
		field.findOne('[data-test-id=field]').props.onClick({
			stopPropagation: jest.fn(),
			clientX: 3,
			clientY: 3,
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
		const onClick = jest.fn()
		const onPointerMove = jest.fn()
		const onPointerUp = jest.fn()

		const field = isolateComponent(
			<Field
				numberOfHelperLines={4}
				startZoneSizeMm={1}
				heightMm={100}
				widthMm={100}
				onClick={onClick}
				onPointerMove={onPointerMove}
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

		// Click on field
		field.findOne('[data-test-id=field]').props.onClick({
			stopPropagation: jest.fn(),
			clientX: 3,
			clientY: 3,
		})

		// Move pointer
		field.findOne('[data-test-id=field]').props.onPointerMove({
			stopPropagation: jest.fn(),
			clientX: 5,
			clientY: 5,
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
