import type { Static } from '@sinclair/typebox'
import {
	gameControllerShadow,
	validateGameControllerShadow,
} from 'api/validateGameControllerShadow.js'

const goodShadow: Static<typeof gameControllerShadow> = {
	state: {
		reported: {
			round: 0,
			robots: [
				{
					mac: '00:25:96:FF:FE:12:34:56',
					angleDeg: 0,
					driveTimeMs: 0,
					revolutionCount: 0,
				},
			],
		},
	},
}

describe('validateGameControllerShadow()', () => {
	it('should validate a reported game state', () => {
		const maybeValid = validateGameControllerShadow(goodShadow)
		expect(maybeValid).not.toHaveProperty('error')
		expect(maybeValid).toMatchObject(goodShadow)
	})
	it('should not validate an invalid shadow', () => {
		const maybeValid = validateGameControllerShadow({
			...goodShadow,
			state: {
				...goodShadow.state,
				reported: {
					...goodShadow.state.reported,
					// Invalid round number
					round: -1,
				},
			},
		})
		expect(maybeValid).toHaveProperty('error')
	})
})
