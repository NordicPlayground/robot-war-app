import { teamColor } from 'utils/teamColor.js'

describe('teamColor()', () => {
	const t1 = 'Titans'
	const t2 = 'Gear Grinders'

	it('should return hex colors', () =>
		expect(teamColor(t1)).toMatch(/#[a-f0-9]{6}/))

	it('should provide stable team colors', () => {
		expect(teamColor(t2)).toEqual(teamColor(t2))
		expect(teamColor(t1)).toEqual(teamColor(t1))
	})

	it('should provide different colors per team', () =>
		expect(teamColor(t1)).not.toEqual(teamColor(t2)))

	it('should provide a default color', () =>
		expect(teamColor()).toMatch(/#[a-f0-9]{6}/))

	it('should provide the same default color', () =>
		expect(teamColor()).toEqual(teamColor()))
})
