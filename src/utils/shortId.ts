/**This is needed, because we want to reduce the id/MAC-adress displayed for the
 * robots to a given number that should be equal everywhere
 */
export const shortId = (id: string): string => id.slice(0, 3)
