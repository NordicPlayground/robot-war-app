import { useAWSIoTPersistence } from 'api/hooks/useAWSIoTPersistence.js'
import { useAWSIoTPollingUpdates } from 'api/hooks/useAWSIoTPollingUpdates.js'
import type { FunctionComponent } from 'react'

export const AWSIoTPersistence: FunctionComponent = () => {
	useAWSIoTPersistence()
	useAWSIoTPollingUpdates()

	return null
}
