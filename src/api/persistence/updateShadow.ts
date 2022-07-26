import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { TObject } from '@sinclair/typebox'
import type { ErrorInfo } from 'api/persistence/errors/ErrorInfo.js'
import type { AWSIoTShadow } from 'api/persistence/getShadow.js'
import { validateWithJSONSchema } from 'api/persistence/validateWithJSONSchema.js'

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
	}): Promise<ErrorInfo | AWSIoTShadow<Schema>> => {
		const maybeValidShadow = validateWithJSONSchema(schema)(stateUpdate)
		if ('error' in maybeValidShadow) {
			return maybeValidShadow as ErrorInfo
		}
		const { payload } = await iotDataPlaneClient.send(
			new UpdateThingShadowCommand({
				thingName: thingName,
				shadowName,
				payload: new TextEncoder().encode(
					JSON.stringify({ state: stateUpdate }),
				),
			}),
		)
		if (payload === undefined) {
			throw new Error(
				`Failed to update ${thingName}'s ${
					shadowName ?? 'default'
				} shadow: response payload is empty.`,
			)
		}
		return JSON.parse(toUtf8(payload)) as AWSIoTShadow<Schema>
	}
