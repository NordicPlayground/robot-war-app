export const shortestRotation = (targetAngle: number): number => {
	if (targetAngle > 180) targetAngle = ((targetAngle + 180) % 360) - 180
	if (targetAngle < -180) targetAngle = ((targetAngle - 180) % 360) + 180
	return targetAngle
}
