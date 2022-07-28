import { teamColor } from 'utils/teamColor.js'

const colorRx = /#[a-f0-9]{6}/

describe('teamColor()', () => {
	const t1 = 'Titans'
	const t2 = 'Gear Grinders'

	it('should return hex colors', () => expect(teamColor(t1)).toMatch(colorRx))

	it('should provide stable team colors', () => {
		expect(teamColor(t2)).toEqual(teamColor(t2))
		expect(teamColor(t1)).toEqual(teamColor(t1))
	})

	it('should provide different colors to the per team, except when there is no more colors to choose from', () => {
		const colors = ['#ffbe0b', '#8338ec']

		const team1Color = teamColor(t1, colors)
		const team2Color = teamColor(t2, colors)
		expect(team1Color).not.toEqual(team2Color)

		// If we run out of colors, the last color is used
		const team3Color = teamColor('Team 3', colors)
		expect(team3Color).toMatch(colorRx)
		expect(team3Color).toEqual(colors[colors.length - 1])
	})

	it('should provide a defaults color', () =>
		expect(teamColor()).toMatch(/#[a-f0-9]{6}/))

	it('should provide the same default color', () =>
		expect(teamColor()).toEqual(teamColor()))
})
