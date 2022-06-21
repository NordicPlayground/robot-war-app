import {
	GameIcon,
	IconWithText,
	InfoIcon,
	SettingsIcon,
} from 'components/FeatherIcon'
import styles from 'components/Navbar.module.css'
import { useAppConfig } from 'hooks/useAppConfig'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '/logo-white-outline.svg'

export const Navbar = () => {
	const {
		manifest: { backgroundColor, shortName, name },
	} = useAppConfig()
	const [navbarOpen, setNavbarOpen] = useState<boolean>(false)

	const close = () => {
		setNavbarOpen(false)
	}

	return (
		<header>
			<nav
				className="navbar navbar-expand-lg navbar-dark"
				style={{
					backgroundColor,
				}}
			>
				<div className="container-fluid">
					<Link className="navbar-brand d-flex align-items-center" to="/">
						<img
							src={logo}
							alt={name}
							width="30"
							height="24"
							className="d-inline-block align-text-top me-1"
						/>
						<span className={styles.assetName}>{shortName}</span>
					</Link>
					<button
						className="navbar-toggler"
						type="button"
						aria-controls="navbar"
						aria-expanded={navbarOpen}
						aria-label="Toggle navigation"
						onClick={() => {
							setNavbarOpen((open) => !open)
						}}
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<div
						className={`navbar-collapse ${navbarOpen ? '' : 'collapse'}`}
						id="navbar"
					>
						<div className="d-flex justify-content-between align-items-center">
							<ul className="navbar-nav me-4">
								<li className="nav-item">
									<Link className="nav-link" to="/game" onClick={close}>
										<IconWithText>
											<GameIcon /> Game
										</IconWithText>
									</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/settings" onClick={close}>
										<IconWithText>
											<SettingsIcon /> Settings
										</IconWithText>
									</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/about" onClick={close}>
										<IconWithText>
											<InfoIcon /> About
										</IconWithText>
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</nav>
		</header>
	)
}
