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

const {
	region,
	version,
	homepage,
	shortName,
	name,
	themeColor,
	backgroundColor,
} = fromEnv({
	region: 'PUBLIC_AWS_REGION',
	version: 'PUBLIC_VERSION',
	homepage: 'PUBLIC_HOMEPAGE',
	shortName: 'PUBLIC_MANIFEST_SHORT_NAME',
	name: 'PUBLIC_MANIFEST_NAME',
	themeColor: 'PUBLIC_MANIFEST_THEME_COLOR',
	backgroundColor: 'PUBLIC_MANIFEST_BACKGROUND_COLOR',
})(import.meta.env)

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<StrictMode>
		<AppConfigProvider
			version={version}
			homepage={homepage}
			shortName={shortName}
			name={name}
			themeColor={themeColor}
			backgroundColor={backgroundColor}
			baseName={import.meta.env.BASE_URL ?? '/'}
		>
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
