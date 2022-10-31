import { useCore } from 'hooks/useCore'
import { useState } from 'react'
import { shortId } from 'utils/shortId.js'
import { teamColor } from 'utils/teamColor'

export const RobotTeamAssigner = () => {
	const {
		game: { adminAssignRobotToTeam },
		robots,
	} = useCore()

	if (Object.keys(robots).length === 0) return null

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
			}}
		>
			<fieldset>
				<legend>Assign robots to teams </legend>
				<ul>
					{Object.entries(robots)
						.sort(
							([, robotA], [, robotB]) =>
								(robotA.position?.rotationDeg ?? 0) -
								(robotB.position?.rotationDeg ?? 0),
						)
						.map(([address, robot]) => (
							<li key={address}>
								{shortId(address) + ' '}
								<RobotTeam
									address={address}
									team={robot.team}
									onSave={(teamName) => {
										adminAssignRobotToTeam(address, teamName)
									}}
								/>
							</li>
						))}
				</ul>
			</fieldset>
		</form>
	)
}

const RobotTeam = ({
	address,
	team,
	onSave,
}: {
	address: string
	team?: string
	onSave: (teamName: string) => void
}) => {
	const { teams } = useCore()
	const [teamName, setTeamName] = useState<string>(team ?? '')

	const isValidName = () => teamName.length > 0

	return (
		<>
			<label htmlFor={`robot-${address}-name`}>Team {':'}</label>
			<input
				type={'text'}
				id={`robot-${address}-name`}
				value={teamName}
				onChange={(e) => setTeamName(e.target.value)}
				className={'form-control'}
				onBlur={() => {
					if (isValidName()) onSave(teamName)
				}}
				placeholder={'e.g. "Gear Grinders"'}
			/>
			{teams.map((team) => (
				<button
					key={team}
					className={'btn btn-secondary me-1 mt-1'}
					style={{ backgroundColor: teamColor(team) }}
					title={`Assign the robot ${address} to the team ${team}...`}
					onClick={() => {
						onSave(team)
						setTeamName(team)
					}}
				>
					{team}
				</button>
			))}
		</>
	)
}
