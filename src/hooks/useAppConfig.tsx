import { fromEnv } from '@nordicsemiconductor/from-env'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

const { version, homepage, shortName, name, themeColor, backgroundColor } =
	fromEnv({
		version: 'PUBLIC_VERSION',
		homepage: 'PUBLIC_HOMEPAGE',
		shortName: 'PUBLIC_MANIFEST_SHORT_NAME',
		name: 'PUBLIC_MANIFEST_NAME',
		themeColor: 'PUBLIC_MANIFEST_THEME_COLOR',
		backgroundColor: 'PUBLIC_MANIFEST_BACKGROUND_COLOR',
	})(import.meta.env)
type AppConfig = {
	basename: string
	version: string
	homepage: string
	manifest: {
		shortName: string
		name: string
		themeColor: string
		backgroundColor: string
	}
	robotWidthMm: number
	robotLengthMm: number
	fieldWidthMm: number
	fieldHeightMm: number
	startZoneSizeMm: number
	helperLinesNumber: number
	defaultOponentColor: string
	autoUpdateEnabled: boolean
	enableAutoUpdate: (enabled: boolean) => void
	autoUpdateIntervalSeconds: number
	setAutoUpdateIntervalSeconds: (seconds: number) => void
}
const defaultConfig: AppConfig = {
	basename: import.meta.env.BASE_URL ?? '/',
	version,
	homepage,
	manifest: {
		shortName,
		name,
		themeColor,
		backgroundColor,
	},
	robotWidthMm: 100,
	robotLengthMm: 120,
	fieldWidthMm: 1500,
	fieldHeightMm: 1000,
	startZoneSizeMm: 100,
	helperLinesNumber: 3,
	defaultOponentColor: '#000000',
	autoUpdateEnabled: true,
	enableAutoUpdate: () => undefined,
	autoUpdateIntervalSeconds: 2,
	setAutoUpdateIntervalSeconds: () => undefined,
}

export const AppConfigContext = createContext<AppConfig>(defaultConfig)

export const useAppConfig = () => useContext(AppConfigContext)

export const AppConfigProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [autoUpdateEnabled, enableAutoUpdate] = useState<boolean>(
		defaultConfig.autoUpdateEnabled,
	)
	const [autoUpdateIntervalSeconds, setAutoUpdateIntervalSeconds] =
		useState<number>(defaultConfig.autoUpdateIntervalSeconds)
	return (
		<AppConfigContext.Provider
			value={{
				...defaultConfig,
				autoUpdateEnabled,
				enableAutoUpdate: (enabled) => {
					console.debug(
						`[AppConfig]`,
						`${enabled ? 'enabling' : 'disabling'} auto-update`,
					)
					enableAutoUpdate(enabled)
				},
				autoUpdateIntervalSeconds,
				setAutoUpdateIntervalSeconds: (seconds) => {
					console.debug(
						`[AppConfig]`,
						`setting auto-update frequency to`,
						seconds,
						`seconds`,
					)
					setAutoUpdateIntervalSeconds(seconds)
				},
			}}
		>
			{children}
		</AppConfigContext.Provider>
	)
}
