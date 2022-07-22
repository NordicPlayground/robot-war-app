import { getAngle } from 'hooks/useRobotActionGesture.js'

describe('UseRobotActionGesture', () => {
	describe('getAngle', () => {
		it('Given X,Y position, should return an angle', () =>
			expect(getAngle(56, 48)).not.toBeNaN())

		describe('Given diferent positions, the generated angle should be the same', () => {
			/*
			 **              **
			 **         **         **
			 **
			 **     ** --------------- 0
			 **
			 **         **         **
			 **              **
			 */
			describe('0 degrees', () => {
				it.each([
					[10, 0],
					[20, 0],
					[1520, 0],
				])('X=%d, Y=%d -> 0', (x, y) => expect(getAngle(x, y)).toEqual(0))
			})

			/*
			 **              **
			 **         **         45
			 **
			 **     ** --------------- **
			 **
			 **         **         **
			 **              **
			 */
			describe('45 degrees', () => {
				it.each([
					[10, 10],
					[66, 66],
					[845, 845],
				])('X=%d, Y=%d ->45', (x, y) => expect(getAngle(x, y)).toEqual(45))
			})

			/*
			 **              90
			 **         **         **
			 **
			 **     ** --------------- **
			 **
			 **         **         **
			 **              **
			 */
			describe('90 degrees', () => {
				it.each([
					[0, 10],
					[0, 50],
					[0, 879554],
				])('X=%d, Y=%d -> 90', (x, y) => expect(getAngle(x, y)).toEqual(90))
			})

			/*
			 **              **
			 **        135         **
			 **
			 **     ** --------------- **
			 **
			 **         **         **
			 **              **
			 */
			describe('135 degrees', () => {
				it.each([
					[-10, 10],
					[-365, 365],
					[-111111, 111111],
				])('X=%d, Y=%d -> 135', (x, y) => expect(getAngle(x, y)).toEqual(135))
			})

			/*
			 **              **
			 **         **         **
			 **
			 **    180 --------------- **
			 **
			 **         **         **
			 **              **
			 */
			describe('180 degrees', () => {
				it.each([
					[-10, 0],
					[-45, 0],
					[-54184, 0],
				])('X=%d, Y=%d -> 180', (x, y) => expect(getAngle(x, y)).toEqual(180))
			})

			/*
			 **              **
			 **         **         **
			 **
			 **   -180 --------------- **
			 **
			 **         **         **
			 **              **
			 */
			describe('-180 degrees', () => {
				it.each([
					[-10, -0],
					[-61, -0],
					[-315, -0],
				])('X=%d, Y=%d -> 180', (x, y) => expect(getAngle(x, y)).toEqual(-180))
			})

			/*
			 **              **
			 **         **         **
			 **
			 **     ** --------------- **
			 **
			 **       -135         **
			 **              **
			 */
			describe('-135 degrees', () => {
				it.each([
					[-10, -10],
					[-5, -5],
					[-564, -564],
				])('X=%d, Y=%d -> 135', (x, y) => expect(getAngle(x, y)).toEqual(-135))
			})

			/*
			 **              **
			 **         **         **
			 **
			 **     ** --------------- **
			 **
			 **         **         **
			 **             -90
			 */
			describe('-90 degrees', () => {
				it.each([
					[0, -10],
					[0, -510],
					[0, -879554],
				])('X=%d, Y=%d -> 90', (x, y) => expect(getAngle(x, y)).toEqual(-90))
			})

			/*
			 **              **
			 **         **        -45
			 **
			 **     ** --------------- **
			 **
			 **         **         **
			 **              **
			 */
			describe('-45 degrees', () => {
				it.each([
					[10, -10],
					[53, -53],
					[4784, -4784],
				])('X=%d, Y=%d -> 45', (x, y) => expect(getAngle(x, y)).toEqual(-45))
			})

			/*
			 **              **
			 **         **         **
			 **
			 **     ** --------------- -0
			 **
			 **         **         **
			 **              **
			 */
			describe('-0 degrees', () => {
				it.each([
					[10, -0],
					[20, -0],
					[1520, -0],
				])('X=%d, Y=%d -> 0', (x, y) => expect(getAngle(x, y)).toEqual(-0))
			})
		})
	})
})
