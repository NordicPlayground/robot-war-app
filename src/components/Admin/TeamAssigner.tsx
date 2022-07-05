import { useGameAdmin } from 'hooks/useGameAdmin'
import { useGameController } from 'hooks/useGameController'
import { FunctionComponent, useState } from 'react'

export const TeamAssigner: FunctionComponent = () => {
	const { gameState, teamsName, setTeamsName } = useGameController()
	const {
		metaData: { robotTeamAssignment },
		setRobotTeam,
	} = useGameAdmin()
	const [inputValue, setInputValue] = useState('')
	const handleTeamInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	return (
		<div>
			<ul>
				{Object.values(gameState.robots).map((robot) => {
					return (
						<li key={robot.mac}>
							<label htmlFor="robots"> {robot.mac} : </label>
							<select
								className="form-select"
								id={robot.mac}
								onChange={(e) => setRobotTeam(robot.mac, e.target.value)}
							>
								<option value="0">Select team</option>
								{teamsName.map(
									(option: Record<string, string>, index: number) => (
										<option key={index} value={index + 1}>
											{option.name}
										</option>
									),
								)}
							</select>
						</li>
					)
				})}
			</ul>
			<label htmlFor="newTeam"> Create your team name: </label>
			<input
				type="string"
				placeholder="Your new team name"
				id="newTeamName"
				onBlur={handleTeamInput}
			></input>
			<button
				className="btn btn-success"
				// TODO: Set correct types
				onClick={() => {
					setTeamsName((commands: any[]) => [...commands, { name: inputValue }])
				}}
			>
				{' '}
				Save team name
			</button>
			<button
				className="btn btn-danger"
				onClick={() => {
					setTeamsName([{ name: 'A' }, { name: 'B' }])
				}}
			>
				{' '}
				Reset Teams
			</button>
		</div>
	)
}
