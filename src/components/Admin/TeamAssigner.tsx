import { useGameAdmin } from 'hooks/useGameAdmin'
import { useGameController } from 'hooks/useGameController'
import type { FunctionComponent } from 'react'

export const TeamAssigner: FunctionComponent = () => {
	const { gameState } = useGameController()
	const { setRobotTeam, metaData: robotTeamAssignment } = useGameAdmin()

	return (
		<ul>
			{Object.values(gameState.robots).map((robot) => {
				return (
					<li key={robot.mac}>
						<label htmlFor="robots"> {robot.mac} : </label>
						<select
							className="form-select"
							name="robot"
							id={robot.mac}
							onChange={(e) => setRobotTeam(robot.mac, e.target.value)}
						>
							<option value=""> Select team </option>
							<option value="TeamA"> Team A</option>
							<option value="TeamB"> Team B</option>
						</select>
					</li>
				)
			})}
		</ul>
	)
}
