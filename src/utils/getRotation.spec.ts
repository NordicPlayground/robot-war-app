import { getRotation } from 'utils/getRotation.js'

describe('getRotation', () => {
	it('Given a coordinate should return a rotation degree', () =>
		expect(getRotation(56, 48)).not.toBeNaN())

	describe('Given diferent positions, the generated rotation degree should be the same', () => {
		/**
		 *              0
		 *         **         **
		 *
		 *     ** --------------- **
		 *
		 *         **         **
		 *              **
		 */
		describe('0 degrees', () => {
			it.each([
				[0, 10],
				[0, 50],
				[0, 879554],
			])('X=%d, Y=%d -> 0', (x, y) => expect(getRotation(x, y)).toEqual(0))
		})

		/**
		 *              **
		 *        45         **
		 *
		 *     ** --------------- **
		 *
		 *         **         **
		 *              **
		 */
		describe('45 degrees', () => {
			it.each([
				[-10, 10],
				[-365, 365],
				[-111111, 111111],
			])('X=%d, Y=%d -> 45', (x, y) => expect(getRotation(x, y)).toEqual(45))
		})

		/**
		 *              **
		 *         **         **
		 *
		 *     90 --------------- **
		 *
		 *         **         **
		 *              **
		 */
		describe('90 degrees', () => {
			it.each([
				[-10, 0],
				[-45, 0],
				[-54184, 0],
				[-10, -0],
				[-61, -0],
				[-315, -0],
			])('X=%d, Y=%d -> 90', (x, y) => expect(getRotation(x, y)).toEqual(90))
		})

		/**
		 *              **
		 *         **         **
		 *
		 *     ** --------------- **
		 *
		 *        135         **
		 *              **
		 */
		describe('135 degrees', () => {
			it.each([
				[-10, -10],
				[-5, -5],
				[-564, -564],
			])('X=%d, Y=%d -> 135', (x, y) => expect(getRotation(x, y)).toEqual(135))
		})

		/**
		 *              **
		 *         **         **
		 *
		 *     ** --------------- **
		 *
		 *         **         **
		 *             180
		 */
		describe('180 degrees', () => {
			it.each([
				[0, -10],
				[0, -510],
				[0, -879554],
			])('X=%d, Y=%d -> 180', (x, y) => expect(getRotation(x, y)).toEqual(180))
		})

		/**
		 *              **
		 *         **         **
		 *
		 *     ** --------------- **
		 *
		 *         **         225
		 *              **
		 */
		describe('225 degrees', () => {
			it.each([
				[10, -10],
				[53, -53],
				[4784, -4784],
			])('X=%d, Y=%d -> 225', (x, y) => expect(getRotation(x, y)).toEqual(225))
		})

		/**
		 *              **
		 *         **         **
		 *
		 *     ** --------------- 270
		 *
		 *         **         **
		 *              **
		 */
		describe('270 degrees', () => {
			it.each([
				[10, 0],
				[20, 0],
				[1520, 0],
				[10, -0],
				[20, -0],
				[1520, -0],
			])('X=%d, Y=%d -> 270', (x, y) => expect(getRotation(x, y)).toEqual(270))
		})

		/**
		 *              **
		 *         **         315
		 *
		 *     ** --------------- **
		 *
		 *         **         **
		 *              **
		 */
		describe('315 degrees', () => {
			it.each([
				[10, 10],
				[66, 66],
				[845, 845],
			])('X=%d, Y=%d -> 315', (x, y) => expect(getRotation(x, y)).toEqual(315))
		})
	})
})
