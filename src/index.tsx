import { fromEnv } from '@nordicsemiconductor/from-env'
import { CredentialsProvider } from 'api/hooks/useCredentials'
import { App } from 'app/App'
import { AWSIoTPersistence } from 'components/Storage/AWSIoTPersistence'
import { AppConfigProvider } from 'hooks/useAppConfig'
import { CoreProvider } from 'hooks/useCore'
import { DragGestureProvider } from 'hooks/useDragGesture'
import { GameControllerThingProvider } from 'hooks/useGameControllerThing'
import { TeamProvider } from 'hooks/useTeam'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const { region } = fromEnv({
	region: 'PUBLIC_AWS_REGION',
})(import.meta.env)

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<StrictMode>
		<AppConfigProvider>
			<CoreProvider>
				<CredentialsProvider region={region}>
					<GameControllerThingProvider>
						<TeamProvider>
							<AWSIoTPersistence />
							<DragGestureProvider>
								<App />
							</DragGestureProvider>
						</TeamProvider>
					</GameControllerThingProvider>
				</CredentialsProvider>
			</CoreProvider>
		</AppConfigProvider>
	</StrictMode>,
)
