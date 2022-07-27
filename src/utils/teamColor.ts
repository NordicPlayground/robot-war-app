export const defaultColor = '#333333'
const teamColors: Record<string, string> = {}
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
	'#fs15bb5',
]

/**
 * Provide stable colors for teams
 */
export const teamColor = (team?: string): string => {
	if (team === undefined) return defaultColor
	if (teamColors[team] === undefined) {
		let color = teamColorOption[0]
		let pickedColor = isColorPicked(color)
		let count = 0
		while (pickedColor) {
			count += 1
			if (count === teamColorOption.length) {
				console.debug(
					'Ohh nooo, team color should be unique and there are more teams than color options available!',
				)
				break
			}

			color = teamColorOption[count]
			pickedColor = isColorPicked(color)
		}
		teamColors[team] = color
	}
	return teamColors[team]
}

const isColorPicked = (color: string) =>
	Object.values(teamColors).includes(color)
