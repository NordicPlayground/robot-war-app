/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react'
import { SampleCoreComponent } from 'components/SampleCoreComponent.js'
import { gameEngine } from 'core/gameEngine.js'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { CoreProvider } from 'hooks/useCore.js'
import { createRoot } from 'react-dom/client'

describe('A component that uses the core', () => {
	let container: HTMLDivElement | null = null

	beforeEach(() => {
		container = document.createElement('div')
		document.body.appendChild(container)
	})

	afterEach(() => {
		if (container !== null) document.body.removeChild(container)
		container = null
	})

	it('should render a message if no robots are found', () => {
		act(() => {
			createRoot(container as HTMLDivElement).render(<SampleCoreComponent />)
		})
		expect(container?.textContent).toContain('No robots discovered!')
	})

	it('should render the list of robots', () => {
		const game = gameEngine({
			field: {
				heightMm: 1000,
				widthMm: 1500,
			},
		})
		act(() => {
			createRoot(container as HTMLDivElement).render(
				<CoreProvider game={game}>
					<SampleCoreComponent />
				</CoreProvider>,
			)
		})
		expect(container?.textContent).toContain('No robots discovered!')

		// Gateway reports discovered robots
		const robotAddress1 = randomMac()
		const robotAddress2 = randomMac()
		act(() => {
			game.gatewayReportDiscoveredRobots({
				[robotAddress1]: randomRobot(),
				[robotAddress2]: randomRobot(),
			})
		})

		// Should display mac address of discovered robot
		expect(container?.textContent).toContain(robotAddress1)
		expect(container?.textContent).toContain(robotAddress2)
	})
})
