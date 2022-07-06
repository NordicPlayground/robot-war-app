import { calculateReported } from 'api/calculateReported.js'

describe('calculateReported()', () => {
	it('should calculate the updated reported shadow', () =>
		expect(
			calculateReported({
				robots: {
					'00:25:96:FF:FE:12:34:51': {
						angleDeg: 1,
						driveTimeMs: 2,
					},
					'00:25:96:FF:FE:12:34:52': {
						angleDeg: 2,
						driveTimeMs: 2,
					},
					'00:25:96:FF:FE:12:34:53': {
						angleDeg: 3,
						driveTimeMs: 3,
					},
					'00:25:96:FF:FE:12:34:54': {
						angleDeg: 4,
						driveTimeMs: 4,
					},
					'00:25:96:FF:FE:12:34:55': {
						angleDeg: 5,
						driveTimeMs: 5,
					},
					'00:25:96:FF:FE:12:34:56': {
						angleDeg: 6,
						driveTimeMs: 6,
					},
					'00:25:96:FF:FE:12:34:57': {
						angleDeg: 7,
						driveTimeMs: 7,
					},
					'00:25:96:FF:FE:12:34:58': {
						angleDeg: 8,
						driveTimeMs: 8,
					},
				},
				reported: {
					round: 0,
					robots: {
						'00:25:96:FF:FE:12:34:51': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:52': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:53': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:54': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:55': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:56': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:57': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
						'00:25:96:FF:FE:12:34:58': {
							angleDeg: 0,
							driveTimeMs: 0,
							revolutionCount: 0,
						},
					},
				},
			}),
		).toEqual({
			round: 0,
			robots: {
				'00:25:96:FF:FE:12:34:51': {
					angleDeg: 1,
					driveTimeMs: 2,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:52': {
					angleDeg: 2,
					driveTimeMs: 2,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:53': {
					angleDeg: 3,
					driveTimeMs: 3,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:54': {
					angleDeg: 4,
					driveTimeMs: 4,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:55': {
					angleDeg: 5,
					driveTimeMs: 5,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:56': {
					angleDeg: 6,
					driveTimeMs: 6,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:57': {
					angleDeg: 7,
					driveTimeMs: 7,
					revolutionCount: 0,
				},
				'00:25:96:FF:FE:12:34:58': {
					angleDeg: 8,
					driveTimeMs: 8,
					revolutionCount: 0,
				},
			},
		}))
})
