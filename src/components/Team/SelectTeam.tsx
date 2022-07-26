import { Popup } from 'components/Popup'
import styles from 'components/Popup.module.css'
import type { FunctionComponent } from 'react'

/**
 * Select the team from the user perspective
 */
export const SelectTeam: FunctionComponent<{
	teams: string[]
	onSelect: (team: string) => void
}> = ({ teams, onSelect }) => {
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
					onSelect(e.target.value)
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
