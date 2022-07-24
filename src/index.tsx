import { App } from 'app/App'
import { AWSIoTPersistenceProvider } from 'components/Storage/AWSIoTPersistence'
import { AppConfigProvider } from 'hooks/useAppConfig'
import { CoreProvider } from 'hooks/useCore'
import { CredentialsProvider } from 'hooks/useCredentials'
import { GameControllerThingProvider } from 'hooks/useGameControllerThing'
import { RobotActionProvider } from 'hooks/useRobotActionGesture'
import { TeamProvider } from 'hooks/useTeam'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<StrictMode>
		<AppConfigProvider>
			<CredentialsProvider>
				<GameControllerThingProvider>
					<CoreProvider>
						<TeamProvider>
							<AWSIoTPersistenceProvider>
								<RobotActionProvider>
									<App />
								</RobotActionProvider>
							</AWSIoTPersistenceProvider>
						</TeamProvider>
					</CoreProvider>
				</GameControllerThingProvider>
			</CredentialsProvider>
		</AppConfigProvider>
	</StrictMode>,
)
