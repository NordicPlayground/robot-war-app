import type { Static } from '@sinclair/typebox'
import type { Position } from 'api/validateGameAdminShadow.js'
import type {
	MacAddress,
	ReportedGameState,
	Robot,
} from 'api/validateGameControllerShadow.js'
import equal from 'fast-deep-equal'

export enum GameEngineEventType {
	robots_discovered = 'robots_discovered',
	robot_team_assigned = 'robot_team_assigned',
	robot_position_set = 'robot_position_set',
	robot_rotation_set = 'robot_rotation_set',
	teams_ready_to_fight = 'teams_ready_to_fight',
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
	 * Returns the list of teams ready to fight
	 */
	teamsReady: string[]
	/**
	 * Returns the list of robots and their configurations
	 */
	robots: () => Static<typeof ReportedGameState>['robots']
	/**
	 * Used by the Gateway to report discovered robots
	 */
	gatewayReportDiscoveredRobots: (
		robots: Static<typeof ReportedGameState>['robots'],
	) => void
	/**
	 * Used by the Admin to assign a robot to a team
	 */
	adminAssignRobotToTeam: (
		robotAddress: Static<typeof MacAddress>,
		name: string,
	) => void
	/**
	 * Used by the Admin to set the position of a robot
	 */
	adminSetRobotPosition: (
		robotAddress: Static<typeof MacAddress>,
		position: Omit<Static<typeof Position>, 'rotationDeg'>,
	) => void
	/**
	 * Used by the Admin to set the rotation of a robot
	 */
	adminSetRobotRotation: (
		robotAddress: Static<typeof MacAddress>,
		rotationDeg: Static<typeof Position>['rotationDeg'],
	) => void
	/**
	 * Used by the Team to set the desired rotation of a robot
	 */
	teamSetDesiredRobotMovement: (args: {
		robotAdress: Static<typeof MacAddress>
		angleDeg: Static<typeof Robot>['angleDeg']
		driveTimeMs: Static<typeof Robot>['driveTimeMs']
	}) => void
	/**
	 * Used by the Team to signal that they are ready for the next round.
	 */
	teamFight: (team: string) => void
	// TODO: implement `on: (type: string, fn: EventListener) => void` to listeners get only notified for specific events
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
	const teamsReady: string[] = []

	const getTeamForRobot = (robotAddress: string): string | undefined =>
		robotTeamAssignments[robotAddress]

	const listOfTeams = () => Object.values(robotTeamAssignments)
	const areAllTeamsReady = () => teamsReady.length === listOfTeams().length
	const hasTeamRobots = (team: string) => listOfTeams().includes(team)
	return {
		field,
		teamsReady,
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
		gatewayReportDiscoveredRobots: (newRobots) => {
			if (!equal(robots, newRobots)) {
				robots = newRobots
				notify({ name: GameEngineEventType.robots_discovered })
			}
		},
		adminAssignRobotToTeam: (robotAddress, name) => {
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
		adminSetRobotPosition: (robotAddress, { xMm, yMm }) => {
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
		adminSetRobotRotation: (robotAddress, rotationDeg) => {
			if (
				rotationDeg < 0 ||
				rotationDeg >= 360 ||
				!Number.isFinite(rotationDeg)
			)
				throw new Error(`Invalid angle provided: ${rotationDeg}!`)
			if (robotPostions[robotAddress] === undefined)
				throw new Error(
					`Robot ${robotAddress} has not been placed on the field, yet!`,
				)
			robotPostions[robotAddress].rotationDeg = rotationDeg
			notify({
				name: GameEngineEventType.robot_rotation_set,
				address: robotAddress,
				position: {
					rotationDeg,
				},
			})
		},
		teamSetDesiredRobotMovement: ({
			robotAdress: address,
			angleDeg,
			driveTimeMs,
		}) => {
			if (robots[address] === undefined)
				throw new Error(`robotAddress not valid: ${address}`)
			if (
				driveTimeMs > 1000 ||
				driveTimeMs < 0 ||
				!Number.isInteger(driveTimeMs)
			)
				throw new Error(`invalid driveTimeMs provided: ${driveTimeMs}`)
			if (angleDeg > 180 || angleDeg < -180 || !Number.isInteger(angleDeg))
				throw new Error(`invalid angleDeg provided: ${angleDeg}`)
			const robotTeam = getTeamForRobot(address)
			if (robotTeam === undefined)
				throw new Error(`No team found for robot: ${address}!`)
			if (teamsReady.includes(robotTeam))
				throw new Error(
					`Cannot move robot after team is ready to fight: ${address}!`,
				)
			// Users can only modify robots that have been placed on the field by an admin
			if (robotPostions[address] === undefined)
				throw new Error(
					`Robot ${address} has not been placed on the field, yet!`,
				)
			robots[address].angleDeg = angleDeg
			robots[address].driveTimeMs = driveTimeMs
		},
		teamFight: (team: string) => {
			if (teamsReady.includes(team)) {
				throw new Error(`"${team}" is already ready to fight!`)
			}
			if (!listOfTeams().includes(team)) {
				throw new Error(`Unknown team provided: ${team}`)
			}

			const teamHasRobots = hasTeamRobots(team)
			if (teamHasRobots === false) {
				throw new Error(`Team has no robots: ${team}`)
			}

			teamsReady.push(team)
			const allReady = areAllTeamsReady()
			if (allReady) {
				notify({
					name: GameEngineEventType.teams_ready_to_fight,
				})
			}
		},
		onAll: (listener) => {
			listeners.push(listener)
		},
		offAll: (listener) => {
			delete listeners[listeners.indexOf(listener)]
		},
	}
}
