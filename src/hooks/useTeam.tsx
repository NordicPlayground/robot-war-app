import { useCore } from 'hooks/useCore.js'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
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

const SELECTED_TEAM = 'useTeam:selected-team'

const storedTeam = localStorage.getItem(SELECTED_TEAM) ?? undefined

export const TeamProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const { teams } = useCore()
	const [selectedTeam, setSelectedTeam] = useState<string | undefined>(
		teams.find((name) => name === storedTeam),
	)

	useEffect(() => {
		if (teams.find((name) => name === storedTeam) !== undefined)
			setSelectedTeam(storedTeam)
	}, [teams])

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
