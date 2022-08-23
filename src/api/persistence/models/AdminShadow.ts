import { Type } from '@sinclair/typebox'
import { MacAddress } from 'core/models/MacAddress.js'
import {
	Coordinates,
	RobotPosition,
	Rotation,
} from 'core/models/RobotPosition.js'
import { TeamId } from 'core/models/TeamId.js'

export const AdminShadow = Type.Object({
	reported: Type.Object({
		teamsReadyToFight: Type.Optional(Type.Array(Type.String())),
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

export const AdminShadowUpdate = Type.Object({
	reported: Type.Object({
		teamsReadyToFight: Type.Optional(Type.Array(Type.String())),
		robotTeamAssignment: Type.Optional(Type.Record(MacAddress, TeamId)),
		robotFieldPosition: Type.Optional(
			Type.Record(
				MacAddress,
				Type.Union([Coordinates, Rotation, RobotPosition]),
			),
		),
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
