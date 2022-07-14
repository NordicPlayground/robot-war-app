import type { Static } from '@sinclair/typebox'
import type { gameControllerAdminShadow } from 'api/validateGameAdminShadow'

export const adminShadow: Static<
	typeof gameControllerAdminShadow
>['state']['reported'] = {
	robotFieldPosition: {
		'00:25:96:FF:FE:12:34:53': {
			xMm: 1105,
			yMm: 199,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:54': {
			xMm: 625,
			yMm: 401,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:52': {
			xMm: 942,
			yMm: 461,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:51': {
			xMm: 590,
			yMm: 619,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:56': {
			xMm: 684,
			yMm: 666,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:57': {
			xMm: 479,
			yMm: 531,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:55': {
			xMm: 341,
			yMm: 661,
			rotationDeg: 0,
		},
		'00:25:96:FF:FE:12:34:58': {
			xMm: 784,
			yMm: 323,
			rotationDeg: 0,
		},
	},
	robotTeamAssignment: {
		'00:25:96:FF:FE:12:34:52': 'Lena',
		'00:25:96:FF:FE:12:34:51': 'Lena',
		'00:25:96:FF:FE:12:34:53': 'Lena',
		'00:25:96:FF:FE:12:34:55': 'A',
		'00:25:96:FF:FE:12:34:57': 'A',
		'00:25:96:FF:FE:12:34:54': 'Lena',
		'00:25:96:FF:FE:12:34:56': 'A',
		'00:25:96:FF:FE:12:34:58': 'A',
	},
}
