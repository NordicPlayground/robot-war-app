import { Type } from '@sinclair/typebox'
import { useGameControllerThing } from 'api/hooks/useGameControllerThing.js'
import { useIoTDataPlaneClient } from 'api/hooks/useIoTDataPlaneClient.js'
import { gameEvent2AdminStateUpdate } from 'api/persistence/gameEvent2AdminStateUpdate'
import { gameEvent2GatewayStateUpdate } from 'api/persistence/gameEvent2GatewayStateUpdate'
import { AdminShadowUpdate } from 'api/persistence/models/AdminShadow'
import { updateShadow } from 'api/persistence/updateShadow'
import type { GameEngineEvent } from 'core/gameEngine'
import { MacAddress } from 'core/models/MacAddress.js'
import { Robot } from 'core/models/Robot.js'
import { useAppConfig } from 'hooks/useAppConfig'
import { useCore } from 'hooks/useCore.js'
import { debounce, merge } from 'lodash-es'
import { useCallback, useEffect, useRef } from 'react'

const updateVersion =
	(ref: React.MutableRefObject<number>, label: string) =>
	(newVersion: number): void => {
		ref.current = newVersion
		console.debug(
			`[useAWSIoTPersistence]`,
			`${label} shadow version`,
			ref.current,
		)
	}

export const useAWSIoTPersistence = (): void => {
	const { game } = useCore()
	const { thingName, getState, getAdminState } = useGameControllerThing()
	const iotDataPlaneClient = useIoTDataPlaneClient()
	const { autoUpdateEnabled, autoUpdateIntervalSeconds } = useAppConfig()

	const gatewayShadowVersion = useRef<number>(-1)
	const adminShadowVersion = useRef<number>(-1)
	const updateGatewayVersion = useCallback(
		(version: number) =>
			updateVersion(gatewayShadowVersion, 'gateway')(version),
		[gatewayShadowVersion],
	)
	const updateAdminVersion = useCallback(
		(version: number) => updateVersion(adminShadowVersion, 'admin')(version),
		[adminShadowVersion],
	)

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
				schema: AdminShadowUpdate,
			})({ reported: updates })
			if (res !== undefined && 'error' in res) {
				console.error(res.error)
				console.error(res.error.details)
			} else {
				updateAdminVersion(res.version)
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
			} else {
				updateGatewayVersion(res.version)
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

		const enableListeners = () => {
			console.debug(`[useAWSIoTPersistence]`, `enabling listeners`)
			game.onAll(adminEventHandler)
			game.onAll(teamEventHandler)
		}
		const disableListeners = () => {
			console.debug(`[useAWSIoTPersistence]`, `disabling listeners`)
			game.offAll(adminEventHandler)
			game.offAll(teamEventHandler)
		}

		// Retrieve current cloud state
		Promise.all([getState(), getAdminState()])
			.then(([maybeGameControllerShadow, maybeAdminShadow]) => {
				// Restore discovered robots
				if ('error' in maybeGameControllerShadow) {
					console.error(maybeGameControllerShadow)
				} else {
					updateGatewayVersion(maybeGameControllerShadow.version)
					game.gatewayReportDiscoveredRobots(
						maybeGameControllerShadow.state.reported.robots,
					)
				}
				// Restore admin positioning
				if ('error' in maybeAdminShadow) {
					console.error(maybeAdminShadow)
				} else {
					updateAdminVersion(maybeAdminShadow.version)
					if (maybeAdminShadow.state.reported.teamsReadyToFight !== undefined) {
						game.gatewayReportTeamsReady(
							maybeAdminShadow.state.reported.teamsReadyToFight,
						)
					}
					if (
						maybeAdminShadow.state.reported.robotFieldPosition !== undefined
					) {
						game.adminSetAllRobotPositions(
							maybeAdminShadow.state.reported.robotFieldPosition,
						)
					}
					if (
						maybeAdminShadow.state.reported.robotTeamAssignment !== undefined
					) {
						game.adminAssignAllRobotTeams(
							maybeAdminShadow.state.reported.robotTeamAssignment,
						)
					}
				}
				// Set team's desired movements
				if (!('error' in maybeGameControllerShadow)) {
					game.teamSetAllRobotMovements(
						maybeGameControllerShadow.state.desired?.robots ?? {},
					)
				}
			})
			.finally(() => {
				// Listen to all changes, after we have loaded the state so we do not trigger the storage
				enableListeners()
			})

		// TODO: Polling makes integrating the updates unneccessary complicated, listen to individual change events via webhooks instead
		let autoUpdateInterval: NodeJS.Timeout
		if (autoUpdateEnabled) {
			const intervalSeconds = Math.max(5, autoUpdateIntervalSeconds)
			console.debug(
				`[useAWSIoTPersistence]`,
				'enabling auto-update every',
				intervalSeconds,
				'seconds',
			)
			autoUpdateInterval = setInterval(() => {
				Promise.all([getState(), getAdminState()])
					.then(([maybeGatewayState, maybeAdminState]) => {
						if ('error' in maybeGatewayState) {
							console.error(maybeGatewayState.error)
						} else if (
							maybeGatewayState.version > gatewayShadowVersion.current
						) {
							console.debug(
								`[useAWSIoTPersistence]`,
								`gateway shadow was changed`,
								`current version`,
								gatewayShadowVersion.current,
								`next version`,
								maybeGatewayState.version,
							)
							updateGatewayVersion(maybeGatewayState.version)
						}
						if ('error' in maybeAdminState) {
							console.error(maybeAdminState.error)
						} else if (maybeAdminState.version > adminShadowVersion.current) {
							console.debug(
								`[useAWSIoTPersistence]`,
								`admin shadow was changed`,
								`current version`,
								adminShadowVersion.current,
								`next version`,
								maybeAdminState.version,
							)
							if (
								maybeAdminState.state.reported.teamsReadyToFight !== undefined
							) {
								disableListeners()
								game.gatewayReportTeamsReady(
									maybeAdminState.state.reported.teamsReadyToFight,
								)
								enableListeners()
							}
							if (
								maybeAdminState.state.reported.robotFieldPosition !== undefined
							) {
								disableListeners()
								game.adminSetAllRobotPositions(
									maybeAdminState.state.reported.robotFieldPosition,
								)
								enableListeners()
							}
							if (
								maybeAdminState.state.reported.robotTeamAssignment !== undefined
							) {
								disableListeners()
								game.adminAssignAllRobotTeams(
									maybeAdminState.state.reported.robotTeamAssignment,
								)
								enableListeners()
							}
							updateAdminVersion(maybeAdminState.version)
						}
					})
					.catch((err) => console.error(`[useAWSIoTPersistence]`, err))
			}, intervalSeconds * 1000)
		}

		return () => {
			console.log(`[useAWSIoTPersistence]`, 'closing connection')
			disableListeners()
			if (autoUpdateInterval !== undefined) {
				clearInterval(autoUpdateInterval)
				console.debug(`[useAWSIoTPersistence]`, 'disabling auto-update')
			}
		}
	}, [
		game,
		thingName,
		iotDataPlaneClient,
		autoUpdateEnabled,
		autoUpdateIntervalSeconds,
		getAdminState,
		getState,
		updateAdminVersion,
		updateGatewayVersion,
	])
}
