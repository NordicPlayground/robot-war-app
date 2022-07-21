import { About } from 'app/pages/About'
import { Admin } from 'app/pages/Admin'
import { Game } from 'app/pages/Game'
import { GameControllers } from 'app/pages/GameControllers'
import { GameEngine } from 'app/pages/GameEngine'
import { Settings } from 'app/pages/Settings'
import { Navbar } from 'components/Navbar'
import { RedirectFrom404 } from 'components/RedirectFrom404'
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
				<Route path="/admin" element={<Admin />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/about" element={<About />} />
				<Route path="/gameengine" element={<GameEngine />} />
			</Routes>
			<RedirectFrom404 />
		</Router>
	)
}
