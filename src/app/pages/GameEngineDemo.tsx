import { useCore } from 'hooks/useCore'
import { useState } from 'react'

export const GameEngineDemo = () => {
	const {
		game: { adminAssignRobotToTeam },
		robots,
	} = useCore()

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
								adminAssignRobotToTeam(address, teamName)
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
