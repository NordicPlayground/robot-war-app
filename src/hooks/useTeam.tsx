import { useCore } from 'hooks/useCore.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

type Team = {
	selectedTeam?: string
	setSelectedTeam: (team: string) => void
}

export const TeamContext = createContext<Team>({
	setSelectedTeam: () => undefined,
})

export const useTeam = () => useContext(TeamContext)

const SELECTED_TEAM = 'Team:auto-update-interval'

export const TeamProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	let storedTeam = localStorage.getItem(SELECTED_TEAM) ?? undefined
	const { teams } = useCore()
	if (storedTeam !== undefined && !teams.includes(storedTeam))
		storedTeam = undefined
	const [selectedTeam, setSelectedTeam] = useState<string | undefined>(
		storedTeam,
	)
	return (
		<TeamContext.Provider
			value={{
				selectedTeam,
				setSelectedTeam: (team) => {
					if (!teams.includes(team)) {
						console.error(`[Team]`, 'unknown team', team)
						return
					}
					console.debug(`[Team]`, 'selected', team)
					setSelectedTeam(team)
					localStorage.setItem(SELECTED_TEAM, team)
				},
			}}
		>
			{children}
		</TeamContext.Provider>
	)
}
