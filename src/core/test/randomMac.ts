/**
 * Generates a random mac.
 *
 * @example a01d30436ac5
 */
export const randomMac = (): string =>
	'XXXXXXXXXXXX'.replace(/X/g, () =>
		'0123456789abcdef'.charAt(Math.floor(Math.random() * 16)),
	)
