import { randomMac } from 'core/test/randomMac'
import { randomRobot } from 'core/test/randomRobot'
import { useCore } from 'hooks/useCore'
import { useState } from 'react'

export const GameEngineDemo = () => {
	const { assignRobotToTeam } = useCore()

	// TODO: robots are not loaded yet from storage
	const robots = {
		[randomMac()]: randomRobot(),
	}

	return (
		<>
			<h1>Game Engine Demo</h1>

			<ul>
				{Object.entries(robots).map(([address, robot]) => (
					<li key={address}>
						{address}
						<RobotTeam
							address={address}
							onSave={(teamName) => {
								assignRobotToTeam(address, teamName)
							}}
						/>
					</li>
				))}
			</ul>
		</>
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
