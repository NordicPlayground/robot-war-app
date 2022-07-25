import { Type } from '@sinclair/typebox'
import { MacAddress } from 'core/models/MacAddress.js'
import { Robot } from 'core/models/Robot.js'

export const DesiredGameState = Type.Object({
	robots: Type.Optional(Type.Record(MacAddress, Robot)),
})
