import { useRef } from 'react'

const safeDocument: Document = document

export const useScrollBlock = (): [() => void, () => void] => {
	const scrollBlocked = useRef(false)
	const html = safeDocument.documentElement
	const { body } = safeDocument

	const blockScroll = (): void => {
		if (body == null || body.style == null || scrollBlocked.current) return
		if (document === undefined) return

		const scrollBarWidth = window.innerWidth - html.clientWidth
		const bodyPaddingRight =
			parseInt(
				window.getComputedStyle(body).getPropertyValue('padding-right'),
			) || 0

		html.style.position = 'relative' /* [1] */
		html.style.overflow = 'hidden' /* [2] */
		body.style.position = 'relative' /* [1] */
		body.style.overflow = 'hidden' /* [2] */
		body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`

		scrollBlocked.current = true
	}

	const allowScroll = (): void => {
		if (body == null || body.style == null || !scrollBlocked.current) return

		html.style.position = ''
		html.style.overflow = ''
		body.style.position = ''
		body.style.overflow = ''
		body.style.paddingRight = ''

		scrollBlocked.current = false
	}

	return [blockScroll, allowScroll]
}
