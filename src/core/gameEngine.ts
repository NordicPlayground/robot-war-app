import type { Static } from '@sinclair/typebox'
import type { Position } from 'api/validateGameAdminShadow.js'
import type {
	MacAddress,
	ReportedGameState,
} from 'api/validateGameControllerShadow.js'

type GameEngine = {
	field: {
		widthMm: number
		heightMm: number
	}
	robots: () => Static<typeof ReportedGameState>['robots']
	reportDiscoveredRobots: (
		robots: Static<typeof ReportedGameState>['robots'],
	) => void
	assignRobotToTeam: (
		robotAddress: Static<typeof MacAddress>,
		name: string,
	) => void
	setRobotPosition: (
		robotAddress: Static<typeof MacAddress>,
		position: Omit<Static<typeof Position>, 'rotationDeg'>,
	) => void
	setRobotRotation: (
		robotAddress: Static<typeof MacAddress>,
		rotationDeg: Static<typeof Position>['rotationDeg'],
	) => void
}

export const gameEngine = ({
	field,
}: {
	field: {
		heightMm: number
		widthMm: number
	}
}): GameEngine => {
	let robots: Static<typeof ReportedGameState>['robots'] = {}
	const robotTeamAssignments: Record<Static<typeof MacAddress>, string> = {}
	const robotPostions: Record<
		Static<typeof MacAddress>,
		Static<typeof Position>
	> = {}

	return {
		field,
		robots: () =>
			Object.entries(robots)
				.map(([address, robot]) => ({
					address,
					...robot,
					team: robotTeamAssignments[address],
					position: robotPostions[address],
				}))
				.reduce(
					(namedRobots, { address, ...rest }) => ({
						...namedRobots,
						[address]: {
							...rest,
						},
					}),
					{},
				),
		reportDiscoveredRobots: (newRobots) => {
			robots = newRobots
		},
		assignRobotToTeam: (robotAddress, name) => {
			if (name.length === 0) {
				throw new Error(`Name cannot be blank!`)
			}
			robotTeamAssignments[robotAddress] = name
		},
		setRobotPosition: (robotAddress, { xMm, yMm }) => {
			if (!Number.isInteger(xMm) || !Number.isInteger(yMm))
				throw new Error(`Invalid position provided: ${xMm}/${yMm}!`)
			if (xMm < 0 || xMm >= field.heightMm || yMm < 0 || yMm >= field.widthMm)
				throw new Error(`'Position is outside of field: ${xMm}/${yMm}!`)
			robotPostions[robotAddress] = {
				xMm,
				yMm,
				rotationDeg: yMm < field.widthMm / 2 ? 90 : 270,
			}
		},
		setRobotRotation: (robotAddress, rotationDeg) => {
			if (
				rotationDeg < 0 ||
				rotationDeg >= 360 ||
				!Number.isFinite(rotationDeg)
			)
				throw new Error(`Invalid angle provided: ${rotationDeg}!`)
			robotPostions[robotAddress].rotationDeg = rotationDeg
		},
	}
}
