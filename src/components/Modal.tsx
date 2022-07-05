import styles from 'components/Modal.module.css'
import type { PropsWithChildren } from 'react'

export const Modal = ({ children }: PropsWithChildren<unknown>) => {
	return (
		<div className={styles.modal}>
			<div className={styles.modalContent}>{children}</div>
		</div>
	)
}
