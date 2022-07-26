/*
 ** Given a coordinate return its rotation degree in a range from 0 to 360 taking 0 as the North
 **                   N
 **
 **                   0
 **             45        315
 **
 **   W     90 --------------- 270    E
 **
 **            135        225
 **                  180
 **
 **                  S
 */
export const getRotation = (x: number, y: number): number => {
	const rad = Math.atan2(y, x) // In radians
	const deg = rad * (180 / Math.PI) // In degrees
	return (
		(deg +
			180 + // Normalize to 360 degrees
			90) % // North is up
		360
	)
}
