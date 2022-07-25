import { Type } from '@sinclair/typebox'
import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient.js'
import { gameEvent2AdminStateUpdate } from 'api/persistence/gameEvent2AdminStateUpdate'
import { gameEvent2GatewayStateUpdate } from 'api/persistence/gameEvent2GatewayStateUpdate'
import { getShadow } from 'api/persistence/getShadow'
import { AdminShadow } from 'api/persistence/models/AdminShadow'
import { GameControllerShadow } from 'api/persistence/models/GameControllerShadow'
import { updateShadow } from 'api/persistence/updateShadow'
import type { GameEngineEvent } from 'core/gameEngine'
import { MacAddress } from 'core/models/MacAddress.js'
import { Robot } from 'core/models/Robot.js'
import { useCore } from 'hooks/useCore.js'
import { useGameControllerThing } from 'hooks/useGameControllerThing.js'
import { debounce, merge } from 'lodash-es'
import { useEffect } from 'react'

export const useAWSIoTPersistence = (): void => {
	const { game } = useCore()
	const { thingName } = useGameControllerThing()
	const iotDataPlaneClient = useIoTDataPlaneClient()

	// Set up storing of changes
	useEffect(() => {
		if (thingName === undefined) return
		if (iotDataPlaneClient === undefined) return

		let pendingAdminChanges: Record<string, any>[] = []
		const debouncedPersistAdminChange = debounce(async () => {
			const updates = {}
			for (const update of pendingAdminChanges) {
				merge(updates, update)
			}
			pendingAdminChanges = []
			console.log(`[useAWSIoTPersistence]`, 'persisting', updates)
			const res = await updateShadow({
				iotDataPlaneClient,
				thingName,
				shadowName: 'admin',
				schema: AdminShadow,
			})({ reported: updates })
			if (res !== undefined && 'error' in res) {
				console.error(res.error)
				console.error(res.error.details)
			}
		}, 1000)

		let pendingTeamChanges: Record<string, any>[] = []
		const debouncedPersistTeamChange = debounce(async () => {
			const updates = {}
			for (const update of pendingTeamChanges) {
				merge(updates, update)
			}
			pendingTeamChanges = []
			console.log(`[useAWSIoTPersistence]`, 'persisting', updates)
			const res = await updateShadow({
				iotDataPlaneClient,
				thingName,
				schema: Type.Object({
					desired: Type.Object({ robots: Type.Record(MacAddress, Robot) }),
				}),
			})({ desired: { robots: updates } })
			if (res !== undefined && 'error' in res) {
				console.error(res.error)
				console.error(res.error.details)
			}
		}, 1000)

		// Set up persisting of admin changes to the AWS IoT game controller thing
		console.log(`[useAWSIoTPersistence]`, 'setting up connection')

		const adminEventHandler = async (event: GameEngineEvent) => {
			const update = gameEvent2AdminStateUpdate(event)
			if (update !== undefined) {
				console.log(`[useAWSIoTPersistence]`, event.name, update)
				pendingAdminChanges.push(update)
				await debouncedPersistAdminChange()
			}
		}

		const teamEventHandler = async (event: GameEngineEvent) => {
			const update = gameEvent2GatewayStateUpdate(event)
			if (update !== undefined) {
				console.log(`[useAWSIoTPersistence]`, event.name, update)
				pendingTeamChanges.push(update)
				await debouncedPersistTeamChange()
			}
		}

		// Retrieve current cloud state
		Promise.all([
			getShadow({
				iotDataPlaneClient,
				thingName,
				schema: GameControllerShadow,
			})(),
			getShadow({
				iotDataPlaneClient,
				thingName,
				schema: AdminShadow,
				shadowName: 'admin',
			})(),
		])
			.then(([maybeGameControllerShadow, maybeAdminShadow]) => {
				// Restore discovered robots
				if ('error' in maybeGameControllerShadow) {
					console.error(maybeGameControllerShadow)
				} else {
					game.gatewayReportDiscoveredRobots(
						maybeGameControllerShadow.reported.robots,
					)
				}
				// Restore admin positioning
				if ('error' in maybeAdminShadow) {
					console.error(maybeAdminShadow)
				} else {
					if (maybeAdminShadow.reported.robotFieldPosition !== undefined) {
						game.adminSetAllRobotPositions(
							maybeAdminShadow.reported.robotFieldPosition,
						)
					}
					if (maybeAdminShadow.reported.robotTeamAssignment !== undefined) {
						game.adminAssignAllRobotTeams(
							maybeAdminShadow.reported.robotTeamAssignment,
						)
					}
				}
				// Set team's desired movements
				if (!('error' in maybeGameControllerShadow)) {
					game.teamSetAllRobotMovements(
						maybeGameControllerShadow.desired?.robots ?? {},
					)
				}
			})
			.finally(() => {
				// Listen to all changes, after we have loaded the state so we do not trigger the storage
				game.onAll(adminEventHandler)
				game.onAll(teamEventHandler)
			})

		return () => {
			console.log(`[useAWSIoTPersistence]`, 'closing connection')
			game.offAll(adminEventHandler)
			game.offAll(teamEventHandler)
		}
	}, [game, thingName, iotDataPlaneClient])
}
