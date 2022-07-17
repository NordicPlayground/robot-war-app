import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { useCredentials } from 'hooks/useCredentials.js'
import { createContext } from 'react'

export const AWSIoTPersistenceContext = createContext(undefined)

export const useIoTDataPlaneClient = (): IoTDataPlaneClient | undefined => {
	const { region, accessKeyId, secretAccessKey } = useCredentials()

	if (accessKeyId === undefined) return
	if (secretAccessKey === undefined) return

	return new IoTDataPlaneClient({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	})
}
