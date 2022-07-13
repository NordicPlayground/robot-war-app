import type { Static } from '@sinclair/typebox'
import type { Position } from 'api/validateGameAdminShadow.js'
import type {
	MacAddress,
	ReportedGameState,
} from 'api/validateGameControllerShadow.js'
import equal from 'fast-deep-equal'

export enum GameEngineEventType {
	robots_discovered = 'robots_discovered',
	robot_team_assigned = 'robot_team_assigned',
	robot_position_set = 'robot_position_set',
	robot_rotation_set = 'robot_rotation_set',
}

type EventListener = (event: GameEngineEvent) => void

export type GameEngineEvent = {
	name: GameEngineEventType
	[key: string]: any
}

export type GameEngine = {
	field: {
		widthMm: number
		heightMm: number
	}
	/**
	 * Returns the list of robots and their configurations
	 */
	robots: () => Static<typeof ReportedGameState>['robots']
	/**
	 * Used by the Gateway to report discovered robots
	 */
	reportDiscoveredRobots: (
		robots: Static<typeof ReportedGameState>['robots'],
	) => void
	/**
	 * Used by the Admin to assign a robot to a team
	 */
	assignRobotToTeam: (
		robotAddress: Static<typeof MacAddress>,
		name: string,
	) => void
	/**
	 * Used by the Admin to set the position of a robot
	 */
	setRobotPosition: (
		robotAddress: Static<typeof MacAddress>,
		position: Omit<Static<typeof Position>, 'rotationDeg'>,
	) => void
	/**
	 * Used by the Admin to set the rotation of a robot
	 */
	setRobotRotation: (
		robotAddress: Static<typeof MacAddress>,
		rotationDeg: Static<typeof Position>['rotationDeg'],
	) => void
	onAll: (fn: EventListener) => void
	offAll: (fn: EventListener) => void
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
	const listeners: EventListener[] = []
	const notify = (event: GameEngineEvent) => {
		listeners.forEach((fn) => fn(event))
	}

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
			if (!equal(robots, newRobots)) {
				robots = newRobots
				notify({ name: GameEngineEventType.robots_discovered })
			}
		},
		assignRobotToTeam: (robotAddress, name) => {
			if (name.length === 0) {
				throw new Error(`Name cannot be blank!`)
			}
			robotTeamAssignments[robotAddress] = name
			notify({
				name: GameEngineEventType.robot_team_assigned,
				address: robotAddress,
				team: name,
			})
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
			notify({
				name: GameEngineEventType.robot_position_set,
				address: robotAddress,
				position: {
					xMm,
					yMm,
				},
			})
		},
		setRobotRotation: (robotAddress, rotationDeg) => {
			if (
				rotationDeg < 0 ||
				rotationDeg >= 360 ||
				!Number.isFinite(rotationDeg)
			)
				throw new Error(`Invalid angle provided: ${rotationDeg}!`)
			robotPostions[robotAddress].rotationDeg = rotationDeg
			notify({
				name: GameEngineEventType.robot_rotation_set,
				address: robotAddress,
				position: {
					rotationDeg,
				},
			})
		},
		onAll: (listener) => {
			listeners.push(listener)
		},
		offAll: (listener) => {
			delete listeners[listeners.indexOf(listener)]
		},
	}
}
