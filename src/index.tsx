import { App } from 'app/App'
import { CredentialsProvider } from 'hooks/useCredentials'
import { GameControllerProvider } from 'hooks/useGameController'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<CredentialsProvider>
		<GameControllerProvider>
			<App />
		</GameControllerProvider>
	</CredentialsProvider>,
)
