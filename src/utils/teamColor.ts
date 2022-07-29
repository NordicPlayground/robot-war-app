export const defaultColor = '#333333'
const teamColors: Record<string, string> = {}

// https://coolors.co/ffbe0b-8338ec-fb5607-3a86ff-ff006e-00f5d4-00bbf9-ffe440-9b5de5-f15bb5
const teamColorOption = [
	'#ffbe0b',
	'#8338ec',
	'#fb5607',
	'#3a86ff',
	'#ff006e',
	'#00f5d4',
	'#00bbf9',
	'#ffe440',
	'#9b5de5',
	'#f15bb5',
]

/**
 * Provide stable colors for teams.
 *
 * If there are not enough colors, the last one in the list is used.
 */
export const teamColor = (
	team?: string,
	availableColors = teamColorOption,
): string => {
	if (team === undefined) return defaultColor
	if (teamColors[team] === undefined) {
		const pickedColors = Object.values(teamColors)
		const unpickedColor = availableColors.find(
			(color) => !pickedColors.includes(color),
		)
		teamColors[team] =
			unpickedColor ?? availableColors[availableColors.length - 1]
	}
	return teamColors[team]
}
