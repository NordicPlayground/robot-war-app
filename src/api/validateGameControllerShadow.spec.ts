import type { Static } from '@sinclair/typebox'
import {
	gameControllerShadow,
	validateGameControllerShadow,
} from 'api/validateGameControllerShadow.js'

const goodShadow: Static<typeof gameControllerShadow> = {
	state: {
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
					//Invalid robot
					robots: -1,
				},
			},
		})
		expect(maybeValid).toHaveProperty('error')
	})
})
