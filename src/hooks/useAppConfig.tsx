import { fromEnv } from '@nordicsemiconductor/from-env'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

const isTest = process.env.NODE_ENV === 'test'

const { version, homepage, shortName, name, themeColor, backgroundColor } =
	fromEnv({
		version: 'PUBLIC_VERSION',
		homepage: 'PUBLIC_HOMEPAGE',
		shortName: 'PUBLIC_MANIFEST_SHORT_NAME',
		name: 'PUBLIC_MANIFEST_NAME',
		themeColor: 'PUBLIC_MANIFEST_THEME_COLOR',
		backgroundColor: 'PUBLIC_MANIFEST_BACKGROUND_COLOR',
	})(
		isTest
			? {
					PUBLIC_VERSION: '0.0.0-development',
					PUBLIC_HOMEPAGE: 'https://robotwar.cloud',
					PUBLIC_MANIFEST_SHORT_NAME: 'Robot War App',
					PUBLIC_MANIFEST_NAME: 'nRF Robot War Web Application',
					PUBLIC_MANIFEST_THEME_COLOR: '#232f3e',
					PUBLIC_MANIFEST_BACKGROUND_COLOR: '#232f3e',
			  }
			: import.meta.env,
	)
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
	autoUpdateEnabled: boolean
	enableAutoUpdate: (enabled: boolean) => void
	autoUpdateIntervalSeconds: number
	setAutoUpdateIntervalSeconds: (seconds: number) => void
}

const defaultConfig: AppConfig = {
	basename: isTest ? '/' : import.meta.env.BASE_URL ?? '/',
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
	startZoneSizeMm: 150,
	helperLinesNumber: 3,
	autoUpdateEnabled: true,
	enableAutoUpdate: () => undefined,
	autoUpdateIntervalSeconds: 10,
	setAutoUpdateIntervalSeconds: () => undefined,
}

export const AppConfigContext = createContext<AppConfig>(defaultConfig)

export const useAppConfig = () => useContext(AppConfigContext)

const AUTO_UPDATE_DISABLED = 'appConfig:auto-update-enabled'
const AUTO_UPDATE_INTERVAL = 'appConfig:auto-update-interval'

export const AppConfigProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [autoUpdateEnabled, enableAutoUpdate] = useState<boolean>(
		localStorage.getItem(AUTO_UPDATE_DISABLED) === '1'
			? false
			: defaultConfig.autoUpdateEnabled,
	)
	const [autoUpdateIntervalSeconds, setAutoUpdateIntervalSeconds] =
		useState<number>(
			parseInt(
				localStorage.getItem(AUTO_UPDATE_INTERVAL) ??
					defaultConfig.autoUpdateIntervalSeconds.toString(),
			),
		)
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
					if (enabled) {
						localStorage.removeItem(AUTO_UPDATE_DISABLED)
					} else {
						localStorage.setItem(AUTO_UPDATE_DISABLED, '1')
					}
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
					localStorage.setItem(AUTO_UPDATE_INTERVAL, seconds.toString())
				},
			}}
		>
			{children}
		</AppConfigContext.Provider>
	)
}
