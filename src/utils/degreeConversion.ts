export const degreeConversion = (degree: number): number => {
	if (degree > 180 || degree < -180)
		throw new Error(`Degree is out of range: ${degree}.`)
	return (degree + 360) % 360
}
