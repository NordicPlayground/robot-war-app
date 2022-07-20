/**
 * Convert a degree from 180 format to 360
 */
export const degreeConversion = (degree: number): number => {
	if (degree > 180 || degree < -180)
		throw new Error(`Degree is out of range: ${degree}.`)
	return (degree + 360) % 360
}

/**
 * Takes a value and return its angle after a full rotation.
 * This is specially helpful when angles are bigger than 360
 */
export const angleAfterFullRotation = (degree: number): number => {
	return degree > -360 && degree < 360 ? degree : degree % 360
}
