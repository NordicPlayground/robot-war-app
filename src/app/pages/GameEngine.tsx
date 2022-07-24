import { Main } from 'components/Main'
import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot'
import { useCore } from 'hooks/useCore'
import { useState } from 'react'

export const GameEngine = () => {
	const {
		game: { gatewayReportDiscoveredRobots },
	} = useCore()

	const [nRobots, setNRobots] = useState<number>(4)

	return (
		<Main>
			<div className="card">
				<div className="card-header">Core</div>
				<div className="card-body">
					<div>
						<label htmlFor="numberOfRobots" className="form-label">
							Number of Robots
						</label>
						<input
							type="number"
							step={1}
							min={1}
							className="form-control"
							id="numberOfRobots"
							value={nRobots}
							onChange={(e) => setNRobots(parseInt(e.target.value, 10))}
						/>
					</div>
					<div className="mt-3">
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => {
								const robots: Parameters<
									typeof gatewayReportDiscoveredRobots
								>[0] = {}
								for (let i = 0; i < nRobots; i++) {
									robots[randomMac()] = randomRobot()
								}
								gatewayReportDiscoveredRobots(robots)
							}}
						>
							Generate {nRobots} Robots
						</button>
					</div>
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
