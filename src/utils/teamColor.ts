import { randomColor } from 'utils/randomColor.js'

export const defaultColor = '#333333'
const teamColors: Record<string, string> = {}

/**
 * Provide stable colors for teams
 */
export const teamColor = (team?: string): string => {
	if (team === undefined) return defaultColor
	if (teamColors[team] === undefined) teamColors[team] = randomColor()
	return teamColors[team]
}
