import { Type } from '@sinclair/typebox'

export const MacAddress = Type.String({
	minLength: 16,
	title: 'A MAC address',
	examples: ['00:25:96:FF:FE:12:34:56'],
})
