import { fromEnv } from '@nordicsemiconductor/from-env'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

const { region } = fromEnv({
	region: 'PUBLIC_AWS_REGION',
})(import.meta.env)

export const CredentialsContext = createContext<{
	accessKeyId?: string
	secretAccessKey?: string
	region: string
	updateCredentials: (credentials: {
		accessKeyId: string
		secretAccessKey: string
	}) => void
}>({
	updateCredentials: () => undefined,
	region,
})

export const useCredentials = () => useContext(CredentialsContext)

const ACCESS_KEY_ID_STORAGE_NAME = 'accessKeyId'
const SECRET_ACCESS_KEY_STORAGE_NAME = 'secretAccessKey'

export const CredentialsProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const storedAccessKeyId = localStorage.getItem(ACCESS_KEY_ID_STORAGE_NAME)
	const storedSecretAccessKey = localStorage.getItem(
		SECRET_ACCESS_KEY_STORAGE_NAME,
	)

	const [accessKeyId, setAccessKeyId] = useState<string | undefined>(
		storedAccessKeyId === null ? undefined : storedAccessKeyId,
	)
	const [secretAccessKey, setSecretAccessKey] = useState<string | undefined>(
		storedSecretAccessKey === null ? undefined : storedSecretAccessKey,
	)

	return (
		<CredentialsContext.Provider
			value={{
				accessKeyId,
				secretAccessKey,
				updateCredentials: (credentials) => {
					const { accessKeyId, secretAccessKey } = credentials
					localStorage.setItem(ACCESS_KEY_ID_STORAGE_NAME, accessKeyId)
					localStorage.setItem(SECRET_ACCESS_KEY_STORAGE_NAME, secretAccessKey)
					setAccessKeyId(accessKeyId)
					setSecretAccessKey(secretAccessKey)
				},
				region,
			}}
		>
			{children}
		</CredentialsContext.Provider>
	)
}
