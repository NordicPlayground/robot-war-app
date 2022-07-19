import { gameEngine } from 'core/gameEngine.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('gameEngine', () => {
	it('instantiate a new game with field dimensions', () => {
		const game = gameEngine({
			field: {
				heightMm: 1000,
				widthMm: 1500,
			},
		})
		expect(game).not.toBeUndefined()
		expect(game.field).toEqual({
			widthMm: 1500,
			heightMm: 1000,
		})
	})

	test('that initially there are no robots', () =>
		expect(simpleGame().robots()).toEqual({}))
})
