/**
 * Given an angle between [-360, 360], place it in range [0, 360]
 */
export const convertToPositiveAngle = (degree: number): number => {
	if (degree > 360 || degree < -360)
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
