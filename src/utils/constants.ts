export const helperLinesNumber = 3

export const defaultOponentTeamColor = '#000000'

export const randomColor = (): string =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, '0')}`
