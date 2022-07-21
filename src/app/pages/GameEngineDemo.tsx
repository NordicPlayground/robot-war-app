import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot'
import { useCore } from 'hooks/useCore'
import { useState } from 'react'

export const GameEngineDemo = () => {
	const {
		game: { adminAssignRobotToTeam, gatewayReportDiscoveredRobots },
		robots,
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

			<ul>
				{Object.entries(robots).map(([address, robot]) => (
					<li key={address}>
						{address}
						<RobotTeam
							address={address}
							onSave={(teamName) => {
								adminAssignRobotToTeam(address, teamName)
							}}
						/>
					</li>
				))}
			</ul>

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

const RobotTeam = ({
	address,
	onSave,
}: {
	address: string
	onSave: (teamName: string) => void
}) => {
	const [teamName, setTeamName] = useState<string>('')

	return (
		<>
			<label htmlFor={`robot-${address}-name`}>Team</label>
			<input
				type={'text'}
				id={`robot-${address}-name`}
				value={teamName}
				onChange={(e) => setTeamName(e.target.value)}
			/>
			<button
				type={'button'}
				onClick={() => {
					onSave(teamName)
				}}
			>
				save
			</button>
		</>
	)
}
