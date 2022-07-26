import { IoTClient } from '@aws-sdk/client-iot'
import { useCredentials } from 'hooks/useCredentials.js'

// Ensure clients do not change on every rerender
const configuredClients: Record<string, IoTClient> = {}

export const useIoTClient = (): IoTClient | undefined => {
	const { region, accessKeyId, secretAccessKey } = useCredentials()

	if (accessKeyId === undefined) return
	if (secretAccessKey === undefined) return

	const hash = [region, accessKeyId, secretAccessKey].join(':')
	if (configuredClients[hash] === undefined)
		configuredClients[hash] = new IoTClient({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		})

	return configuredClients[hash]
}
