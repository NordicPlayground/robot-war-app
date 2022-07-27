import { Robot } from 'components/Game/Robot.js'
import { randomMac } from 'core/test/randomMac.js'
import { isolateComponent } from 'isolate-react'
import { randomColor } from 'utils/randomColor.js'

describe('Robot', () => {
	it('should render the MAC as a label', () => {
		const label = randomMac()
		const robot = isolateComponent(
			<Robot
				colorHex={randomColor()}
				heightMm={100}
				widthMm={100}
				id={label}
				xMm={0}
				yMm={0}
				rotationDeg={0}
			/>,
		)
		expect(robot.findOne('[data-test-id=label]').content()).toContain(label)
	})

	it('should render a triangle with the tip facing north', () => {
		const xMm = 42
		const yMm = 17
		const heightMm = 150
		const widthMm = 100
		const robot = isolateComponent(
			<Robot
				colorHex={randomColor()}
				heightMm={heightMm}
				widthMm={widthMm}
				id={randomMac()}
				xMm={xMm}
				yMm={yMm}
				rotationDeg={0}
			/>,
		)
		const pointsOfSVGTriangle: [x: number, y: number][] = robot
			.findOne('[data-test-id=triangle]')
			.props.points.split(' ')
			.map((s: string) => s.split(',').map((s) => parseInt(s, 10)))
		expect(pointsOfSVGTriangle).toHaveLength(3)

		/*

       Width
   |----------|

         T
        /\        -| H
       /  \        | e
      /    \       | i
Y    /  C   \      | g
    /        \     | h
^  /__________\   _| t
|
-> X 		

C = center (given as xMm and yMm)
T = tip

*/

		// It should have ONE point as the tip, and the tip needs to be top end, in the middle
		const centerPoint = pointsOfSVGTriangle
			// The point of the tip is horizontally on the X coordinate of the robot
			.filter(([x]) => x === xMm)
			// and should be 50% of the height above the Y coordinate of the robot
			.filter(([, y]) => y === yMm - heightMm / 2)
		expect(centerPoint).toHaveLength(1)

		// It should have ONE point as the left leg
		const leftLegPoint = pointsOfSVGTriangle
			// The point of the left leg is 50% of the width of the robot to the left of the center
			.filter(([x]) => x === xMm - widthMm / 2)
			// and it is 50% of the height below the center
			.filter(([, y]) => y === yMm + heightMm / 2)
		expect(leftLegPoint).toHaveLength(1)

		// It should have ONE point as the right leg
		const rightLegPoint = pointsOfSVGTriangle
			// The point of the right leg is 50% of the width of the robot to the right of the center
			.filter(([x]) => x === xMm + widthMm / 2)
			// and it is 50% of the height below the center
			.filter(([, y]) => y === yMm + heightMm / 2)
		expect(rightLegPoint).toHaveLength(1)
	})

	it('should return the rotated angle on mouse wheel', () => {
		const onRotate = jest.fn()

		const robot = isolateComponent(
			<Robot
				colorHex={randomColor()}
				heightMm={100}
				widthMm={100}
				id={randomMac()}
				xMm={0}
				yMm={0}
				rotationDeg={0}
				onRotate={onRotate}
			/>,
		)

		// Scroll down
		robot.findOne('[data-test-id=rotation-handle]').props.onWheel({
			stopPropagation: jest.fn(),
			deltaY: 10,
		})
		expect(onRotate).toHaveBeenLastCalledWith(5)

		// Scroll up
		robot.findOne('[data-test-id=rotation-handle]').props.onWheel({
			stopPropagation: jest.fn(),
			deltaY: -10,
		})
		expect(onRotate).toHaveBeenLastCalledWith(-5)
	})

	it('Should trigger onPointerDown', () => {
		const onPointerDown = jest.fn()

		const robot = isolateComponent(
			<Robot
				colorHex={randomColor()}
				heightMm={100}
				widthMm={100}
				id={randomMac()}
				xMm={0}
				yMm={0}
				rotationDeg={0}
				onPointerDown={onPointerDown}
			/>,
		)

		// Simulating a browser click
		robot.findOne('[data-test-id=robot]').props.onPointerDown({
			stopPropagation: jest.fn(),
			clientX: 10,
			clientY: 10,
		})
		expect(onPointerDown).toHaveBeenCalledTimes(1)
		expect(onPointerDown).toHaveBeenCalledWith({ x: 10, y: 10 })
	})

	it('Should trigger onPointerUp', () => {
		const onPointerUp = jest.fn()

		const robot = isolateComponent(
			<Robot
				colorHex={randomColor()}
				heightMm={100}
				widthMm={100}
				id={randomMac()}
				xMm={0}
				yMm={0}
				rotationDeg={0}
				onPointerUp={onPointerUp}
			/>,
		)

		// Simulating a browser click
		robot.findOne('[data-test-id=robot]').props.onPointerUp({
			stopPropagation: jest.fn(),
		})
		expect(onPointerUp).toHaveBeenCalledTimes(1)
	})
})
