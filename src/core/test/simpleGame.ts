import { GameEngine, gameEngine } from 'core/gameEngine.js'

export const simpleGame = (): GameEngine =>
	gameEngine({
		field: {
			heightMm: 1000,
			widthMm: 1500,
		},
	})
