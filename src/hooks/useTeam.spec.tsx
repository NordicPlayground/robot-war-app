/**
 * @jest-environment jsdom
 */
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'
import { TeamContext, TeamProvider } from 'hooks/useTeam.js'
import { isolateComponent } from 'isolate-react'

describe('useTeam()', () => {
	describe('<TeamProvider/>', () => {
		const game = simpleGame()
		const robot1 = randomMac()
		const robot2 = randomMac()
		game.gatewayReportDiscoveredRobots({
			[robot1]: randomRobot(),
			[robot2]: randomRobot(),
		})
		game.adminAssignAllRobotTeams({
			[robot1]: 'Ampere Anarchists',
			[robot2]: 'Brutal Bearings',
		})

		it('should have no team selected by default', () => {
			jest.spyOn(Storage.prototype, 'getItem')
			Storage.prototype.getItem = jest.fn(() => null)

			const isolated = isolateComponent(
				<TeamProvider
					useCore={() => ({
						game,
						robots: game.robots(),
						teams: game.teams(),
					})}
				>
					<TeamContext.Consumer>
						{({ selectedTeam }) => selectedTeam}
					</TeamContext.Consumer>
				</TeamProvider>,
			)

			isolated.inline('*')

			expect(isolated.content()).toEqual('')
		})

		it('should allow to select a team, and store the selection in localStorage', async () => {
			jest.spyOn(Storage.prototype, 'setItem')
			const setItem = jest.fn()
			Storage.prototype.setItem = setItem

			const isolated = isolateComponent(
				<TeamProvider
					useCore={() => ({
						game,
						robots: game.robots(),
						teams: game.teams(),
					})}
				>
					<TeamContext.Consumer>
						{({ selectedTeam, setSelectedTeam }) => {
							return (
								<button
									onClick={() => {
										setSelectedTeam('Brutal Bearings')
									}}
								>
									{selectedTeam}
								</button>
							)
						}}
					</TeamContext.Consumer>
				</TeamProvider>,
			)

			isolated.inline('*')

			isolated.findOne('button').props.onClick()

			expect(setItem).toHaveBeenCalledWith(
				'useTeam:selected-team',
				'Brutal Bearings',
			)

			expect(isolated.findOne('button').content()).toEqual('Brutal Bearings')
		})

		it('should auto-select a previously selected team', () => {
			jest.spyOn(Storage.prototype, 'getItem')
			Storage.prototype.getItem = jest.fn(() => 'Ampere Anarchists')

			const isolated = isolateComponent(
				<TeamProvider
					useCore={() => ({
						game,
						robots: game.robots(),
						teams: game.teams(),
					})}
				>
					<TeamContext.Consumer>
						{({ selectedTeam }) => selectedTeam}
					</TeamContext.Consumer>
				</TeamProvider>,
			)

			isolated.inline('*')

			expect(isolated.content()).toEqual('Ampere Anarchists')
		})
	})
})
