import { About } from 'app/pages/About'
import { Game } from 'app/pages/Game'
import { GameControllers } from 'app/pages/GameControllers'
import { Settings } from 'app/pages/Settings'
import { Navbar } from 'components/Navbar'
import { useAppConfig } from 'hooks/useAppConfig'
import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom'

export const App = () => {
	const { basename } = useAppConfig()

	return (
		<Router basename={basename}>
			<Navbar />
			<Routes>
				<Route index element={<Navigate to="/game" />} />
				<Route path="/game" element={<Game />} />
				<Route path="/controllers" element={<GameControllers />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</Router>
	)
}
