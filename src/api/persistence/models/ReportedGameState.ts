import { Type } from '@sinclair/typebox'
import { MacAddress } from 'core/models/MacAddress.js'
import { RobotInGame } from 'core/models/RobotInGame.js'

export const ReportedGameState = Type.Object({
	robots: Type.Record(MacAddress, RobotInGame),
})
