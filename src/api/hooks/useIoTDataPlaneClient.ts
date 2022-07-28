import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { useCredentials } from 'api/hooks/useCredentials.js'

// Ensure clients do not change on every rerender
const configuredClients: Record<string, IoTDataPlaneClient> = {}

export const useIoTDataPlaneClient = (): IoTDataPlaneClient | undefined => {
	const { region, accessKeyId, secretAccessKey } = useCredentials()

	if (accessKeyId === undefined) return
	if (secretAccessKey === undefined) return

	const hash = [region, accessKeyId, secretAccessKey].join(':')
	if (configuredClients[hash] === undefined)
		configuredClients[hash] = new IoTDataPlaneClient({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		})

	return configuredClients[hash]
}
