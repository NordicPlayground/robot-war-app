import { Robot } from 'components/Game/Robot.js'
import { randomMac } from 'core/test/randomMac.js'
import { isolateComponent } from 'isolate-react'
import { randomColor } from 'utils/randomColor.js'

describe('Robot', () => {
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
		robot.findOne('[data-test=rotation-handle]').props.onWheel({
			stopPropagation: jest.fn(),
			deltaY: 10,
		})
		expect(onRotate).toHaveBeenLastCalledWith(5)

		// Scroll up
		robot.findOne('[data-test=rotation-handle]').props.onWheel({
			stopPropagation: jest.fn(),
			deltaY: -10,
		})
		expect(onRotate).toHaveBeenLastCalledWith(-5)
	})
})
