/**
 * Convert the distance returned by the useDragGesture hook into driveTimeMs
 */
export const distanceToDriveTime = (
	/**
	 * Distance in pixels
	 */
	distancePx: number,
): number => Math.round(Math.min(1000, distancePx * 5)) // FIXME: convert to percentage
