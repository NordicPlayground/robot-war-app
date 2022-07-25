import { App } from 'app/App'
import { AWSIoTPersistenceProvider } from 'components/Storage/AWSIoTPersistence'
import { AppConfigProvider } from 'hooks/useAppConfig'
import { CoreProvider } from 'hooks/useCore'
import { CredentialsProvider } from 'hooks/useCredentials'
import { DragGestureProvider } from 'hooks/useDragGesture'
import { GameControllerThingProvider } from 'hooks/useGameControllerThing'
import { TeamProvider } from 'hooks/useTeam'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<StrictMode>
		<AppConfigProvider>
			<CoreProvider>
				<CredentialsProvider>
					<GameControllerThingProvider>
						<TeamProvider>
							<AWSIoTPersistenceProvider>
								<DragGestureProvider>
									<App />
								</DragGestureProvider>
							</AWSIoTPersistenceProvider>
						</TeamProvider>
					</GameControllerThingProvider>
				</CredentialsProvider>
			</CoreProvider>
		</AppConfigProvider>
	</StrictMode>,
)
