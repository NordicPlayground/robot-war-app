import { useAWSIoTPersistence } from 'api/hooks/useAWSIoTPersistence.js'
import type { FunctionComponent } from 'react'

export const AWSIoTPersistence: FunctionComponent = () => {
	useAWSIoTPersistence()

	return null
}
