import type { Static } from '@sinclair/typebox'
import { GameControllerShadow } from 'api/persistence/models/GameControllerShadow.js'
import { validateWithJSONSchema } from 'utils/validateWithJSONSchema.js'

const goodShadow: Static<typeof GameControllerShadow> = {
	reported: {
		robots: {
			'00:25:96:FF:FE:12:34:56': {
				angleDeg: 0,
				driveTimeMs: 0,
				revolutionCount: 0,
			},
		},
	},
	desired: {
		robots: {
			'00:25:96:FF:FE:12:34:56': {
				angleDeg: 0,
				driveTimeMs: 0,
			},
		},
	},
}

describe('validateGameControllerShadow()', () => {
	it('should validate a reported game state', () => {
		const maybeValid = validateWithJSONSchema(GameControllerShadow)(goodShadow)
		expect(maybeValid).not.toHaveProperty('error')
		expect(maybeValid).toMatchObject(goodShadow)
	})
	it('should not validate an invalid shadow', () => {
		const maybeValid = validateWithJSONSchema(GameControllerShadow)({
			...goodShadow,
			reported: {
				...goodShadow.reported,
				//Invalid robot
				robots: -1,
			},
		})
		expect(maybeValid).toHaveProperty('error')
	})
})
