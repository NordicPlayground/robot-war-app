import { Type } from '@sinclair/typebox'
import { DesiredGameState } from 'api/persistence/models/DesiredGameState.js'
import { ReportedGameState } from 'api/persistence/models/ReportedGameState.js'

export const GameControllerShadow = Type.Object({
	desired: Type.Optional(DesiredGameState),
	reported: ReportedGameState,
})
