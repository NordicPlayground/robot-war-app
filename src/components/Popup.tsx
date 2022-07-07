import styles from 'components/Popup.module.css'
import type { PropsWithChildren } from 'react'

export const Popup = ({ children }: PropsWithChildren<unknown>) => {
	return (
		<div className={styles.popup}>
			<div className={styles.popupContent}>{children}</div>
		</div>
	)
}
