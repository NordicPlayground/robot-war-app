import { Main } from 'components/Main'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot'
import { useCore } from 'hooks/useCore'

export const GameEngine = () => {
	const {
		game: { gatewayReportDiscoveredRobots },
	} = useCore()

	return (
		<Main>
			<div className="card">
				<div className="card-header">Core</div>
				<div className="card-body">
					<p>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => {
								gatewayReportDiscoveredRobots({
									[randomMac()]: randomRobot(),
									[randomMac()]: randomRobot(),
									[randomMac()]: randomRobot(),
									[randomMac()]: randomRobot(),
								})
							}}
						>
							Gateway: Generate Robots
						</button>
					</p>
				</div>
			</div>
			<RobotsList />
			<TeamsList />
		</Main>
	)
}

const TeamsList = () => {
	const { teams } = useCore()

	if (teams.length === 0) return null

	return (
		<div className="card mt-4">
			<div className="card-header">Teams</div>
			<div className="card-body">
				<ul>
					{teams.map((team) => (
						<li key={team}>{team}</li>
					))}
				</ul>
			</div>
		</div>
	)
}

const RobotsList = () => {
	const { robots } = useCore()

	if (Object.values(robots).length === 0) return null

	return (
		<div className="card mt-4">
			<div className="card-header">Robots</div>
			<div className="card-body">
				<ul>
					{Object.entries(robots).map(([mac, robot]) => (
						<li key={mac}>{mac}</li>
					))}
				</ul>
			</div>
		</div>
	)
}
