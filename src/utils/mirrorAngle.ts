import { shortestRotation } from 'utils/shortestRotation.js'

export const mirrorAngle = (angle: number): number =>
	shortestRotation(angle + 180)
