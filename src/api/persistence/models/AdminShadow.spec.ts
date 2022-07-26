import type { Static } from '@sinclair/typebox'
import { AdminShadow } from 'api/persistence/models/AdminShadow.js'
import { validateWithJSONSchema } from 'api/persistence/validateWithJSONSchema.js'
import { randomMac } from 'core/test/randomMac.js'

describe('validateAdminShadow()', () => {
	const robot1 = randomMac()
	const robot2 = randomMac()

	const goodShadow: Static<typeof AdminShadow> = {
		reported: {
			robotFieldPosition: {
				[robot1]: {
					rotationDeg: 45,
					xMm: 17,
					yMm: 42,
				},
				[robot2]: {
					rotationDeg: 90,
					xMm: 42,
					yMm: 17,
				},
			},
			robotTeamAssignment: {
				[robot1]: 'Team A',
				[robot2]: 'Team B',
			},
			robotConfiguration: {
				[robot1]: {
					wheelCircumfenceMm: 150,
				},
				[robot2]: {
					wheelCircumfenceMm: 250,
				},
			},
		},
	}
	it('should validate a reported game state', () => {
		const maybeValid = validateWithJSONSchema(AdminShadow)(goodShadow)
		expect(maybeValid).not.toHaveProperty('error')
		expect(maybeValid).toMatchObject(goodShadow)
	})
	it('should not validate an invalid shadow', () => {
		const maybeValid = validateWithJSONSchema(AdminShadow)({
			...goodShadow,
			reported: {
				...goodShadow.reported,
				//Invalid robotFieldPosition
				robotFieldPosition: -1,
			},
		})
		expect(maybeValid).toHaveProperty('error')
	})
})
