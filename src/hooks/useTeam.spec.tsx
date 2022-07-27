/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals'
import { render } from '@testing-library/react'
import type { FunctionComponent, PropsWithChildren } from 'react'

describe('useTeam()', () => {
	describe('<TeamProvider/>', () => {
		it('should have no team selected by default', async () => {
			jest.mock('hooks/useCore.js', () => ({
				__esModule: true,
				default: 'default2',
				foo: 'foo2',
			}))

			const { TeamContext, TeamProvider } = await import('hooks/useTeam.js')

			const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) => (
				<TeamProvider>{children}</TeamProvider>
			)

			render(
				<TeamContext.Consumer>
					{({ selectedTeam }) => {
						expect(selectedTeam).toEqual(undefined)
						return null
					}}
				</TeamContext.Consumer>,
				{
					wrapper,
				},
			)
		})
	})
})
