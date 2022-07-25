import { Type } from '@sinclair/typebox'
import { MacAddress } from 'core/models/MacAddress.js'
import { RobotPosition } from 'core/models/RobotPosition.js'
import { TeamId } from 'core/models/TeamId.js'

export const AdminShadow = Type.Object({
	reported: Type.Object({
		robotTeamAssignment: Type.Optional(Type.Record(MacAddress, TeamId)),
		robotFieldPosition: Type.Optional(Type.Record(MacAddress, RobotPosition)),
		robotConfiguration: Type.Optional(
			Type.Record(
				MacAddress,
				Type.Object({
					wheelCircumfenceMm: Type.Optional(
						Type.Integer({
							minimum: 0,
						}),
					),
				}),
			),
		),
	}),
})
