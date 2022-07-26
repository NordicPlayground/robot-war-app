import { Type } from '@sinclair/typebox'

export const Coordinates = Type.Object(
	{
		xMm: Type.Integer({
			minimum: 0,
			title:
				'X-Position (top to bottom) on the field in mm from the top left corner',
		}),
		yMm: Type.Integer({
			minimum: 0,
			title:
				'Y-Position (left to right) on the field in mm from the top left corner',
		}),
	},
	{ title: 'Coordinates on the field' },
)

export const Rotation = Type.Object(
	{
		rotationDeg: Type.Number({
			minimum: 0,
			maximum: 359,
			title:
				'Rotation in degrees, 0 facing North on the field, 90 facing east, 180 facing south, 270 facing west',
		}),
	},
	{ title: 'Rotation on the field' },
)

export const RobotPosition = Type.Intersect([Coordinates, Rotation], {
	title: 'Position on the field',
})
