import { createContext, FunctionComponent, ReactNode, useContext } from 'react'

export const CredentialsContext = createContext<{
	accessKeyId: string | null
	secretAccessKey: string | null
}>({
	accessKeyId: null,
	secretAccessKey: null,
})

export const useCredentials = () => useContext(CredentialsContext)

export const CredentialsProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const accessKeyId = localStorage.getItem('accessKey')
	const secretAccessKey = localStorage.getItem('privateAccessKey')
	if (accessKeyId === null || secretAccessKey === null) {
		console.debug('AWS credentials not available')
	}
	return (
		<CredentialsContext.Provider
			value={{
				accessKeyId,
				secretAccessKey,
			}}
		>
			{children}
		</CredentialsContext.Provider>
	)
}
