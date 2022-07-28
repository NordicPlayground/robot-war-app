import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

const defaultRegion = 'us-east-1'
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
	region: defaultRegion,
})

export const useCredentials = () => useContext(CredentialsContext)

const ACCESS_KEY_ID_STORAGE_NAME = 'accessKeyId'
const SECRET_ACCESS_KEY_STORAGE_NAME = 'secretAccessKey'

export const CredentialsProvider: FunctionComponent<{
	children: ReactNode
	region?: string
}> = ({ children, region }) => {
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
				region: region ?? defaultRegion,
			}}
		>
			{children}
		</CredentialsContext.Provider>
	)
}
