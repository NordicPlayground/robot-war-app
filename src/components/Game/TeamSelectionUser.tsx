import { Popup } from 'components/Popup'
import styles from 'components/Popup.module.css'
import { useGameAdmin } from 'hooks/useGameAdmin'
import { useGameController } from 'hooks/useGameController'
import { useTimer } from 'hooks/useTimer'
import { useState } from 'react'

/*
 ** Select the team from the user perspective
 */
export const TeamSelectionUser = () => {
	const { teamNameOptions, setSelectedTeam } = useGameController()
	const [isTeamSelected, setIsTeamSelected] = useState<boolean>(false)
	const {
		metaData: { robotTeamAssignment },
	} = useGameAdmin()
	// TODO: set team name on welcome message
	// const [teamName, setTeamName] = useState<string|undefined>(undefined)
	const [seconds, start, reset] = useTimer()

	const startCountDown = (teamName: string) => {
		setSelectedTeam(teamName)
		start(3)
		setIsTeamSelected(true)
	}

	if (seconds < 0) {
		reset()
	}

	if (!isTeamSelected) {
		return (
			<Popup>
				<h1 className={styles.title}>SELECT YOUR TEAM</h1>
				<select
					className="form-select"
					id={'teamSelection'}
					onChange={(e) => {
						startCountDown(e.target.value)
					}}
				>
					<option value="0">Select team</option>
					{teamNameOptions.map(
						(team: Record<string, string>, index: number) => (
							<option key={index} value={team.name}>
								{team.name}
							</option>
						),
					)}
				</select>
			</Popup>
		)
	}

	return (
		<>
			{seconds > 0 ? (
				<Popup>
					<h1 className={styles.title}>WELCOME!</h1>
					{/* 
						TODO: set team name on welcome message
						<h2 className={styles.title}>{teamName ?? ''}</h2>
					*/}

					<h2 className={styles.title}>
						{' '}
						You are gonna be redirected to the game in {seconds} seconds{' '}
					</h2>
				</Popup>
			) : null}
		</>
	)
}
