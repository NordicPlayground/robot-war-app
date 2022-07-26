import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { Static, TObject, Type } from '@sinclair/typebox'
import type { ErrorInfo } from 'api/persistence/errors/ErrorInfo.js'
import { NotFoundError } from 'api/persistence/errors/NotFoundError.js'
import { validateWithJSONSchema } from 'api/persistence/validateWithJSONSchema.js'

export const getShadow =
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
	async (): Promise<ErrorInfo | Static<typeof schema>> => {
		const { payload } = await iotDataPlaneClient.send(
			new GetThingShadowCommand({
				thingName: thingName,
				shadowName,
			}),
		)

		if (payload === undefined) {
			return {
				error: new NotFoundError(
					`No ${shadowName ?? 'default'} shadow defined for ${thingName}`,
				),
			}
		}

		const shadow = JSON.parse(toUtf8(payload))

		const maybeValidShadow = validateWithJSONSchema(
			Type.Object({
				state: schema,
			}),
		)(shadow)

		if ('error' in maybeValidShadow) {
			return maybeValidShadow
		}

		return (maybeValidShadow as Record<string, any>).state
	}
