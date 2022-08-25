import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import { MacAddress } from 'core/models/MacAddress.js'
import type { Robot } from 'core/models/Robot.js'
import { RobotInGame } from 'core/models/RobotInGame.js'
import type { RobotPosition } from 'core/models/RobotPosition.js'

export enum GameEngineEventType {
	robots_discovered = 'robots_discovered',
	robot_team_assigned = 'robot_team_assigned',
	robot_teams_assigned = 'robot_teams_assigned',
	robot_position_set = 'robot_position_set',
	robot_positions_set = 'robot_positions_set',
	robot_movement_set = 'robot_movement_set',
	robot_movements_set = 'robot_movements_set',
	teams_ready_to_fight = 'teams_ready_to_fight',
	winner = 'winner',
	next_round = 'next_round',
}

export type EventListener = (event: GameEngineEvent) => void

export type GameEngineEvent = {
	name: GameEngineEventType
	[key: string]: any
}

const Robots = Type.Record(MacAddress, RobotInGame)

export type GameEngine = {
	field: {
		widthMm: number
		heightMm: number
	}
	/**
	 * Returns the list of teams playing the game
	 */
	teams: () => string[]
	/**
	 * Returns the list of teams that have finished configuring the movement of their robots  // but from the gateway
	 */
	teamsFinishedConfiguringRobotsMovement: () => string[]
	/**
	 * Returns the name of winner team
	 */
	winnerTeam: string | undefined
	/**
	 * Returns the list of robots and their configurations
	 */
	robots: () => Static<typeof Robots>
	/**
	 * Used by the Gateway to report discovered robots and report back the
	 * movement of robots.
	 * The update must always include the complete list of robots, however
	 * robots may have no, because initially the gatway only knows the robot
	 * addresses and nothing more.
	 */
	gatewayReportDiscoveredRobots: (
		robots: Record<
			Static<typeof MacAddress>,
			Partial<Static<typeof RobotInGame>>
		>,
	) => void
	gatewayReportTeamsReady: (team: string[]) => void
	/**
	 * Used by the Admin to assign a robot to a team
	 */
	adminAssignRobotToTeam: (
		robotAddress: Static<typeof MacAddress>,
		team: string,
	) => void
	/**
	 * Used by the Admin to assign the team of all robots at once
	 */
	adminAssignAllRobotTeams: (
		assignments: Record<Static<typeof MacAddress>, string>,
	) => void
	/**
	 * Used by the Admin to set the position and rotation on the field of a robot
	 */
	adminSetRobotPosition: (
		robotAddress: Static<typeof MacAddress>,
		position:
			| Static<typeof RobotPosition>
			| Pick<Static<typeof RobotPosition>, 'rotationDeg'>
			| Omit<Static<typeof RobotPosition>, 'rotationDeg'>,
	) => void
	/**
	 * Used by the Admin to set the position and rotation on the field for all robots at once
	 */
	adminSetAllRobotPositions: (
		positions: Record<Static<typeof MacAddress>, Static<typeof RobotPosition>>,
	) => void
	/**
	 * Used by the Team to set the desired rotation of a robot
	 */
	teamSetRobotMovement: (
		robotAdress: Static<typeof MacAddress>,
		movement: {
			angleDeg: Static<typeof Robot>['angleDeg']
			driveTimeMs: Static<typeof Robot>['driveTimeMs']
		},
	) => void
	/**
	 * Used by the Team to set the desired rotation of all robot at once
	 */
	teamSetAllRobotMovements: (
		positions: Record<Static<typeof MacAddress>, Static<typeof Robot>>,
	) => void
	/**
	 * Used by the Team to signal that they are ready for the next round.
	 */
	teamFight: (team: string) => void
	/**
	 * Used by Admin to pick the winner.
	 */
	adminNextRound: () => void
	/**
	 * Used by Admin to pick the winner.
	 */
	adminSetWinner: (team: string) => void
	/**
	 * Notify listeners when event of the given type happens.
	 */
	on: (type: string, fn: EventListener) => void
	/**
	 * Remove previously registered listener for the given event type
	 */
	off: (type: string, fn: EventListener) => void
	/**
	 * Notify listeners about all events
	 */
	onAll: (fn: EventListener) => void
	/**
	 * Remove previously registered listener for all events
	 */
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
	const robots: Static<typeof Robots> = {}
	const robotTeamAssignments: Record<Static<typeof MacAddress>, string> = {}
	const robotPostions: Record<
		Static<typeof MacAddress>,
		Static<typeof RobotPosition>
	> = {}
	const listeners: EventListener[] = []
	const listenersForType: Record<string, EventListener[]> = {}
	const notify = (event: GameEngineEvent) => {
		listeners.forEach((fn) => fn(event))
		;(listenersForType[event.name] ?? []).forEach((fn) => fn(event))
	}
	let teamsReady: string[] = []
	let winnerTeam: string | undefined = undefined

	const getTeamForRobot = (robotAddress: string): string | undefined =>
		robotTeamAssignments[robotAddress]

	const listOfTeams = () => [...new Set(Object.values(robotTeamAssignments))]
	const areAllTeamsReady = () => teamsReady.length === listOfTeams().length // check from shadow
	const hasTeamRobots = (team: string) => listOfTeams().includes(team)

	const updatePosition = (
		robotAddress: string,
		{ xMm, yMm }: Omit<Static<typeof RobotPosition>, 'rotationDeg'>,
	) => {
		if (!Number.isInteger(xMm) || !Number.isInteger(yMm))
			throw new Error(`Invalid position provided: ${xMm}/${yMm}!`)
		if (xMm < 0 || xMm >= field.widthMm || yMm < 0 || yMm >= field.heightMm)
			throw new Error(
				`Position is outside of field: horizontal ${xMm} mm and vertical ${yMm} mm! (Field is ${field.widthMm} mm wide and ${field.heightMm} mm high.)`,
			)
		robotPostions[robotAddress] = {
			xMm,
			yMm,
			rotationDeg:
				robotPostions[robotAddress]?.rotationDeg ??
				(xMm < field.widthMm / 2 ? 90 : 270),
		}
	}

	const updateRotationDeg = (
		robotAddress: string,
		{ rotationDeg }: Pick<Static<typeof RobotPosition>, 'rotationDeg'>,
	) => {
		if (rotationDeg < 0 || rotationDeg >= 360 || !Number.isFinite(rotationDeg))
			throw new Error(`Invalid angle provided: ${rotationDeg}!`)
		if (robotPostions[robotAddress] === undefined)
			throw new Error(
				`Robot ${robotAddress} has not been placed on the field, yet!`,
			)
		robotPostions[robotAddress].rotationDeg = rotationDeg
	}

	const updateRobotMovement = (
		robotAddress: Static<typeof MacAddress>,
		angleDeg: Static<typeof Robot>['angleDeg'],
		driveTimeMs: Static<typeof Robot>['driveTimeMs'],
	) => {
		if (driveTimeMs > 1000 || driveTimeMs < 0 || !Number.isInteger(driveTimeMs))
			throw new Error(`invalid driveTimeMs provided: ${driveTimeMs}`)
		if (angleDeg > 180 || angleDeg < -180 || !Number.isInteger(angleDeg))
			throw new Error(`invalid angleDeg provided: ${angleDeg}`)
		if (robots[robotAddress] === undefined)
			throw new Error(`robotAddress not valid: ${robotAddress}`)
		const robotTeam = getTeamForRobot(robotAddress)
		if (robotTeam === undefined)
			throw new Error(`No team found for robot: ${robotAddress}!`)
		if (teamsReady.includes(robotTeam))
			throw new Error(
				`Cannot move robot after team is ready to fight: ${robotAddress}!`,
			)
		// Users can only modify robots that have been placed on the field by an admin
		if (robotPostions[robotAddress] === undefined)
			throw new Error(
				`Robot ${robotAddress} has not been placed on the field, yet!`,
			)
		robots[robotAddress].angleDeg = angleDeg
		robots[robotAddress].driveTimeMs = driveTimeMs
	}

	return {
		field,
		teams: listOfTeams,
		teamsFinishedConfiguringRobotsMovement: () => teamsReady,
		winnerTeam,
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
			const existingRobots = Object.keys(robots)
			Object.entries(newRobots).forEach(([mac, robot]) => {
				robots[mac] = {
					...(robots[mac] ?? {
						angleDeg: 0,
						driveTimeMs: 0,
						revolutionCount: 0,
					}),
					...robot,
				}
				if (existingRobots.includes(mac))
					delete existingRobots[existingRobots.indexOf(mac)]
			})
			for (const oldRobotMac of existingRobots) {
				delete robots[oldRobotMac]
			}
			notify({ name: GameEngineEventType.robots_discovered })
		},
		gatewayReportTeamsReady: (teams) => {
			console.log('!AQUI!!!!!!!!!!!!!!HERE!!!!!!!!!!!!', teams, teamsReady)
			if (teams.length === 0 && teamsReady.length > 0) teamsReady = []
			const alreadyReadyTeams = teamsReady
			teams.forEach((team) => {
				console.log({ team })
				if (!alreadyReadyTeams.includes(team)) alreadyReadyTeams.push(team)
			})

			//notify({ name: GameEngineEventType.robots_discovered })
		},
		adminAssignRobotToTeam: (robotAddress, team) => {
			validateTeamName(team)
			robotTeamAssignments[robotAddress] = team
			notify({
				name: GameEngineEventType.robot_team_assigned,
				address: robotAddress,
				team,
			})
		},
		adminAssignAllRobotTeams: (assignments) => {
			// Validate names
			for (const [, team] of Object.entries(assignments)) {
				validateTeamName(team)
			}
			for (const [robotAddress, team] of Object.entries(assignments)) {
				robotTeamAssignments[robotAddress] = team
			}
			notify({
				name: GameEngineEventType.robot_teams_assigned,
				assignments,
			})
		},
		adminSetRobotPosition: (robotAddress, positionUpdate) => {
			if ('xMm' in positionUpdate && 'yMm' in positionUpdate)
				updatePosition(robotAddress, positionUpdate)
			if ('rotationDeg' in positionUpdate)
				updateRotationDeg(robotAddress, positionUpdate)
			notify({
				name: GameEngineEventType.robot_position_set,
				address: robotAddress,
				position: positionUpdate,
			})
		},
		adminSetAllRobotPositions: (positions) => {
			Object.entries(positions).forEach(([robotAddress, position]) => {
				updatePosition(robotAddress, position)
				updateRotationDeg(robotAddress, position)
			})
			notify({
				name: GameEngineEventType.robot_positions_set,
				positions,
			})
		},
		teamSetRobotMovement: (address, { angleDeg, driveTimeMs }) => {
			updateRobotMovement(address, angleDeg, driveTimeMs)

			// desired team shadow
			notify({
				name: GameEngineEventType.robot_movement_set,
				address,
				angleDeg,
				driveTimeMs,
			})
		},
		teamSetAllRobotMovements: (movements) => {
			Object.entries(movements).forEach(
				([robotAddress, { angleDeg, driveTimeMs }]) => {
					updateRobotMovement(robotAddress, angleDeg, driveTimeMs)
				},
			)
			notify({
				name: GameEngineEventType.robot_movements_set,
				movements,
			})
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

			console.log('start')
			console.log('--------')
			console.log(teamsReady)
			teamsReady.push(team)
			console.log(teamsReady)
			console.log('--------')

			notify({
				name: GameEngineEventType.teams_ready_to_fight,
				teamsReady,
			})

			console.log({ teamsReady })

			const allReady = areAllTeamsReady()
			if (allReady) {
				Object.entries(robots).forEach(
					([address, { angleDeg, driveTimeMs }]) => {
						notify({
							name: GameEngineEventType.robot_movement_set,
							address,
							angleDeg,
							driveTimeMs,
						})
					},
				)
				notify({
					name: GameEngineEventType.teams_ready_to_fight,
				})
			}
		},
		adminNextRound: () => {
			if (winnerTeam !== undefined) {
				throw new Error(`Game is already finished!`)
			}
			if (teamsReady.length === 0) {
				throw new Error(`Round is already in progress!`)
			}
			teamsReady = []
			notify({
				name: GameEngineEventType.teams_ready_to_fight,
				teamsReady: [],
			})
			notify({
				name: GameEngineEventType.next_round,
			})
		},
		adminSetWinner: (team) => {
			if (!listOfTeams().includes(team)) {
				throw new Error(
					`Cannot select "${team}" as a winner because it was not playing.`,
				)
			}

			if (winnerTeam !== undefined)
				throw new Error(
					`Cannot select "${team}" as a winner because a winner was already selected.`,
				)

			winnerTeam = team
			notify({
				name: GameEngineEventType.winner,
				team: winnerTeam,
			})
		},
		onAll: (listener) => {
			listeners.push(listener)
		},
		offAll: (listener) => {
			delete listeners[listeners.indexOf(listener)]
		},
		on: (type, listener) => {
			if (listenersForType[type] === undefined) listenersForType[type] = []
			listenersForType[type].push(listener)
		},
		off: (type, listener) => {
			const index = (listenersForType[type] ?? []).indexOf(listener)
			if (index !== undefined) delete listenersForType[type][index]
		},
	}
}
function validateTeamName(name: string) {
	if (name.length === 0) {
		throw new Error(`Name cannot be blank!`)
	}
}
