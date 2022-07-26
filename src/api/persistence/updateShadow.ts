import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import type { TObject } from '@sinclair/typebox'
import { validateWithJSONSchema } from 'api/persistence/validateWithJSONSchema.js'
import type { ErrorInfo } from 'utils/errors/ErrorInfo.js'

export const updateShadow =
	<Schema extends TObject>({
		iotDataPlaneClient,
		thingName,
		shadowName,
		schema,
	}: {
		iotDataPlaneClient: IoTDataPlaneClient
		thingName: string
		shadowName?: undefined | 'admin'
		schema: Schema
	}) =>
	async (stateUpdate: {
		reported?: Record<string, any> | null
		desired?: Record<string, any> | null
	}): Promise<ErrorInfo | undefined> => {
		const maybeValidShadow = validateWithJSONSchema(schema)(stateUpdate)
		if ('error' in maybeValidShadow) {
			return maybeValidShadow as ErrorInfo
		}
		await iotDataPlaneClient.send(
			new UpdateThingShadowCommand({
				thingName: thingName,
				shadowName,
				payload: new TextEncoder().encode(
					JSON.stringify({ state: stateUpdate }),
				),
			}),
		)
	}
