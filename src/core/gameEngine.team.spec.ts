import { randomMac } from 'core/test/randomMac.js'
import { randomRobot } from 'core/test/randomRobot.js'
import { simpleGame } from 'core/test/simpleGame.js'

describe('The team should not be able to change the desired robot positions after signalling ready to fight', () => {
	const gameWithOneRobot = simpleGame()
	const teamAsRobot = randomMac()
	const teamA = 'Team A'
	gameWithOneRobot.gatewayReportDiscoveredRobots({
		[teamAsRobot]: randomRobot(),
	})
	gameWithOneRobot.adminAssignRobotToTeam(teamAsRobot, teamA)

	it('should not allow setting the position if the robot has not been placed on the field by the admin', () => {
		expect(() =>
			gameWithOneRobot.teamSetDesiredRobotMovement({
				robotAdress: teamAsRobot,
				angleDeg: 135,
				driveTimeMs: 1000,
			}),
		).toThrow(`Robot ${teamAsRobot} has not been placed on the field, yet!`)
		// Admin places robot
		gameWithOneRobot.adminSetRobotPosition(teamAsRobot, {
			xMm: 100,
			yMm: 100,
		})
	})

	it('Should allow changes by the team as long as it is not ready to fight', () => {
		const finalRotation = 45
		gameWithOneRobot.teamSetDesiredRobotMovement({
			robotAdress: teamAsRobot,
			angleDeg: 135,
			driveTimeMs: 1000,
		})
		gameWithOneRobot.teamSetDesiredRobotMovement({
			robotAdress: teamAsRobot,
			angleDeg: 90,
			driveTimeMs: 1000,
		})
		gameWithOneRobot.teamSetDesiredRobotMovement({
			robotAdress: teamAsRobot,
			angleDeg: finalRotation,
			driveTimeMs: 1000,
		})
		expect(gameWithOneRobot.robots()).toMatchObject({
			[teamAsRobot]: {
				angleDeg: finalRotation,
				driveTimeMs: 1000,
			},
		})
	})

	test('Should not allow changes by the team after they are ready to fight', () => {
		const beforeFight = 45
		gameWithOneRobot.teamSetDesiredRobotMovement({
			robotAdress: teamAsRobot,
			angleDeg: 135,
			driveTimeMs: 1000,
		})
		gameWithOneRobot.teamSetDesiredRobotMovement({
			robotAdress: teamAsRobot,
			angleDeg: beforeFight,
			driveTimeMs: 1000,
		})
		gameWithOneRobot.teamFight(teamA)
		expect(() => {
			gameWithOneRobot.teamSetDesiredRobotMovement({
				robotAdress: teamAsRobot,
				angleDeg: 90,
				driveTimeMs: 1000,
			})
		}).toThrow(
			`Cannot move robot after team is ready to fight: ${teamAsRobot}!`,
		)
		expect(gameWithOneRobot.robots()).toMatchObject({
			[teamAsRobot]: {
				angleDeg: beforeFight,
				driveTimeMs: 1000,
			},
		})
	})
})
