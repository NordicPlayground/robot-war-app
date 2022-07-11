export const randomMac = (): string =>
	'XX:XX:XX:XX:XX:XX'.replace(/X/g, () =>
		'0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16)),
	)
