import { useAWSIoTPersistence } from 'api/hooks/useAWSIoTPersistence.js'
import { createContext, FunctionComponent, ReactNode } from 'react'

export const AWSIoTPersistenceContext = createContext(undefined)

export const AWSIoTPersistenceProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	useAWSIoTPersistence()

	return (
		<AWSIoTPersistenceContext.Provider value={undefined}>
			{children}
		</AWSIoTPersistenceContext.Provider>
	)
}
