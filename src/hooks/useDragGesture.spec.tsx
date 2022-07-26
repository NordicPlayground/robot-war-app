import { result, subtractCoordinates } from 'hooks/useDragGesture.js'

describe('UseRobotActionGesture', () => {
	it('given 2 coordinates should return the rotation degree and distance in pixeles between them', () => {
		const firstCoordinate: [number, number] = [
			Math.floor(Math.random()),
			Math.floor(Math.random()),
		]
		const secondCoordinate: [number, number] = [
			Math.floor(Math.random()),
			Math.floor(Math.random()),
		]
		const { rotationDeg, distancePx } = result(
			firstCoordinate,
			secondCoordinate,
		)
		expect(rotationDeg).toBeDefined()
		expect(rotationDeg).not.toBeNaN()
		expect(distancePx).toBeDefined()
		expect(distancePx).not.toBeNaN()
		// expect(angle(...)).toEqual(42)
	})

	describe('result should calculate the distance between to coordinats', () => {
		it.each([
			[[0, 0], [0, 0], 0],
			[[1, 0], [0, 0], 1],
			[[-3, 0], [0, 0], 3],
			[[0, -5], [0, 0], 5],
			[[1, 1], [0, 0], Math.sqrt(2)],
			[[-1, -1], [0, 0], Math.sqrt(2)],
		])(
			'Distance between %s and %s should be %d',
			([x1, y1], [x2, y2], expectedDistance) => {
				const { distancePx } = result([x1, y1], [x2, y2])
				expect(distancePx).toEqual(expectedDistance)
			},
		)
	})

	describe('subtractCoordinates', () => {
		test('Given 2 coordinates should return the subtract of both, creating a new coordinate', () => {
			const referencePoint: [number, number] = [10, 10]
			const desiredPoint: [number, number] = [50, 50]
			const [x, y] = subtractCoordinates(referencePoint, desiredPoint)
			expect(x).not.toBeNaN()
			expect(y).not.toBeNaN()
		})
		test('Given 2 coordinates should subtract the second coordinate over the first coordinate passed by params', () => {
			const referencePoint: [number, number] = [10, 10]
			const desiredPoint: [number, number] = [50, 50]
			const [x, y] = subtractCoordinates(referencePoint, desiredPoint)
			expect(x).toEqual(-40)
			expect(y).toEqual(-40)
		})
	})
})
