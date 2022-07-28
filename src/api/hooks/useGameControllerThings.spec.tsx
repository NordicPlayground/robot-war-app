import {
	GameControllerThingsContext,
	GameControllerThingsProvider,
} from 'api/hooks/useGameControllerThings.js'
import { isolateComponent } from 'isolate-react'

describe('useGameControllerThings()', () => {
	describe('<GameControllerThingsProvider/>', () => {
		it('should fetch available game controller things', async () => {
			const mockIotClient = {
				send: jest.fn(async () => ({
					things: ['thingA', 'thingB'],
				})),
			}
			const useIotClient = () => mockIotClient as any

			const isolated = isolateComponent(
				<GameControllerThingsProvider useIotClientInjected={useIotClient}>
					<GameControllerThingsContext.Consumer>
						{(things) => <p>{things.join(', ')}</p>}
					</GameControllerThingsContext.Consumer>
				</GameControllerThingsProvider>,
			)

			isolated.inline('*')

			await isolated.waitForRender()

			await Promise.resolve()

			expect(isolated.content()).toContain('thingA, thingB')

			expect(mockIotClient.send).toHaveBeenCalledWith(
				expect.objectContaining({
					input: {
						thingGroupName: 'gameController',
					},
				}),
			)
		})
	})
})
