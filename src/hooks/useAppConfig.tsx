import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useState,
} from 'react'

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
	basename: '/',
	version: '0.0.0-development',
	homepage: 'https://robotwar.cloud',
	manifest: {
		shortName: 'Robot War App',
		name: 'nRF Robot War Web Application',
		themeColor: '#232f3e',
		backgroundColor: '#232f3e',
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
	baseName: string
	version: string
	homepage: string
	shortName: string
	name: string
	themeColor: string
	backgroundColor: string
}> = ({ children, ...config }) => {
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
				...config,
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
