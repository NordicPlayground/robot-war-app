import { App } from 'app/App'
import { AWSIoTPersistenceProvider } from 'components/Storage/AWSIoTPersistence'
import { CoreProvider } from 'hooks/useCore'
import { CredentialsProvider } from 'hooks/useCredentials'
import { GameAdminProvider } from 'hooks/useGameAdmin'
import { GameControllerProvider } from 'hooks/useGameController'
import { GameControllerThingProvider } from 'hooks/useGameControllerThing'
import { RobotActionProvider } from 'hooks/useRobotActionGesture'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<CredentialsProvider>
		<GameControllerThingProvider>
			<CoreProvider>
				<AWSIoTPersistenceProvider>
					<GameControllerProvider>
						<GameAdminProvider>
							<RobotActionProvider>
								<App />
							</RobotActionProvider>
						</GameAdminProvider>
					</GameControllerProvider>
				</AWSIoTPersistenceProvider>
			</CoreProvider>
		</GameControllerThingProvider>
	</CredentialsProvider>,
)
