import { Modal } from 'components/Modal'
import styles from 'components/Modal.module.css'
import { useGameController } from 'hooks/useGameController'
import { useTimer } from 'hooks/useTimer'
import { useState } from 'react'

/*
 ** Select the team from the user perspective
 */
export const SelectTeam = () => {
	const { teamsName, setSelectedTeam, selectedTeam } = useGameController()
	const [isTeamSelected, setIsTeamSelected] = useState<boolean>(false)
	const [seconds, start, reset] = useTimer()

	const startCountDown = (teamName: string) => {
		setSelectedTeam(teamName)
		start(3)
		setIsTeamSelected(true)
	}

	if (seconds < 0) {
		reset()
	}

	// TODO: remove nested ternary operator

	return (
		<>
			{isTeamSelected ? (
				seconds > 0 ? (
					<Modal>
						<h1 className={styles.title}>WELCOME PLAYER OF TEAM </h1>
						<h1 className={styles.title}>{selectedTeam ?? ''}</h1>
						<h2 className={styles.title}>
							{' '}
							You are gonna be redirected to the game in {seconds} seconds{' '}
						</h2>
					</Modal>
				) : null
			) : (
				<Modal>
					<h1 className={styles.title}>SELECT YOUR TEAM</h1>
					<select
						className="form-select"
						id={'teamSelection'}
						onChange={(e) => {
							startCountDown(e.target.value)
						}}
					>
						<option value="0">Select team</option>
						{teamsName.map((team: Record<string, string>, index: number) => (
							<option key={index} value={team.name}>
								{team.name}
							</option>
						))}
					</select>
				</Modal>
			)}
		</>
	)
}
