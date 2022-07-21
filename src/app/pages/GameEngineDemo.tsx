import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot'
import { useCore } from 'hooks/useCore'

export const GameEngineDemo = () => {
	const {
		game: { gatewayReportDiscoveredRobots },
	} = useCore()

	return (
		<>
			<h1>Game Engine Demo</h1>

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

			<RobotsList />

			<TeamsList />
		</>
	)
}

const TeamsList = () => {
	const { teams } = useCore()

	return (
		<ul>
			{teams.map((team) => (
				<li key={team}>{team}</li>
			))}
		</ul>
	)
}

const RobotsList = () => {
	const { robots } = useCore()

	return (
		<ul>
			{Object.entries(robots).map(([mac, robot]) => (
				<li key={mac}>{mac}</li>
			))}
		</ul>
	)
}
