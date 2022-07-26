import { result, subtractCoordinates } from 'hooks/useDragGesture.js'

describe('UseRobotActionGesture', () => {
	describe('given 2 coordinates should return the rotation degree and distance in pixeles between them', () => {
		it.each([
			/*                  0
			 **	  			    |
			 **	  	  B		    |
			 **	  	     A      |
			 **	  			    |
			 **  90  ------------------------- 270
			 **				    |
			 **				    |
			 **			        |
			 **			        |
			 **                 180
			 */
			// [ B ]     [ A ]
			[[-10, 10], [-5, 5], 45, 7],
			[[-100, 100], [-50, 50], 45, 71],

			/*                  0
			 **	  			    |
			 **	  	   		    |
			 **	  	            |
			 **	  			    |
			 **  90  ------------------------- 270
			 **				    |
			 **				A   |
			 **			  B     |
			 **			        |
			 **                 180
			 */
			// [ B ]     [ A ]
			[[-10, -10], [-5, -5], 135, 7],
			[[-100, -100], [-50, -50], 135, 71],

			/*                  0
			 **	  			    |
			 **	  	   		    |
			 **	  	            |
			 **	  			    |
			 **  90  ------------------------- 270
			 **				    |
			 **				    |    A
			 **			        |       B
			 **			        |
			 **                 180
			 */
			// [ B ]     [ A ]
			[[10, -10], [5, -5], 225, 7],
			[[100, -100], [50, -50], 225, 71],

			/*                  0
			 **	  			    |
			 **	  	   		    |      B
			 **	  	            |    A
			 **	  			    |
			 **  90  ------------------------- 270
			 **				    |
			 **				    |
			 **			        |
			 **			        |
			 **                 180
			 */
			// [ B ]     [ A ]
			[[10, 10], [5, 5], 315, 7],
			[[100, 100], [50, 50], 315, 71],
		])(
			'first coordinate: %s, second coordinate: %s. Rotation degree: %d, distance: %d',
			([x1, y1], [x2, y2], expectedRotation, expectedDistance) => {
				const { rotationDeg, distancePx } = result([x1, y1], [x2, y2])

				expect(rotationDeg).toEqual(expectedRotation)
				expect(Math.round(distancePx)).toEqual(expectedDistance)
			},
		)
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
