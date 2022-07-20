import { Popup } from 'components/Popup'
import styles from 'components/Popup.module.css'
import { useCore } from 'hooks/useCore'
import { useTeam } from 'hooks/useTeam'
import { useTimer } from 'hooks/useTimer'

/*
 ** Select the team from the user perspective
 */
export const SelectTeam = () => {
	const { teams } = useCore()
	const { setSelectedTeam, selectedTeam } = useTeam()
	const [seconds, start, reset] = useTimer()

	const startCountDown = (teamName: string) => {
		setSelectedTeam(teamName)
		start(3)
	}
	if (seconds < 0) {
		reset()
	}

	if (selectedTeam === undefined) {
		if (teams.length === 0) {
			return (
				<Popup>
					<h1 className={styles.title}>Please wait ...</h1>
					<p>The GameMaster is preparing the game.</p>
				</Popup>
			)
		}
		return (
			<Popup>
				<h1 className={styles.title}>Please select your team</h1>
				<select
					className="form-select"
					id={'teamSelection'}
					onChange={(e) => {
						startCountDown(e.target.value)
					}}
				>
					<option value="0">Select team</option>
					{teams.map((team) => (
						<option key={team} value={team}>
							{team}
						</option>
					))}
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
