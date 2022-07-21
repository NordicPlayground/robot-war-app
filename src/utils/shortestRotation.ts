export const shortestRotation = (
	targetAngle: number,
	minimumAngle = -180,
	maximumAngle = 180,
): number => {
	if (targetAngle > maximumAngle)
		targetAngle = ((targetAngle + maximumAngle) % 360) + minimumAngle
	if (targetAngle < minimumAngle)
		targetAngle = ((targetAngle + minimumAngle) % 360) + maximumAngle
	const result = Math.round(targetAngle)
	if (result === 360) return 0
	return result
}
