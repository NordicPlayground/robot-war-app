import { result } from 'hooks/useDragGesture.js'

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
	})

	describe('Distance between coordinates should not be negative', () => {
		it.each([
			[
				[10, 10],
				[-10, -10],
			],
			[
				[-89, 154],
				[-87, 45],
			],
			[
				[10, 14780],
				[-8, 40],
			],
			[
				[12, -54],
				[-65, -12],
			],
		])(
			'First coordinate: , Second coordinate: ',
			(firstCoordinate, secondCoordinate) => {
				const { distancePx } = result(
					firstCoordinate as [number, number],
					secondCoordinate as [number, number],
				)
				expect(distancePx).toBeGreaterThanOrEqual(0)
			},
		)
	})
})
