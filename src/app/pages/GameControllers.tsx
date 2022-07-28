import { useGameControllerThing } from 'api/hooks/useGameControllerThing.js'
import { Main } from 'components/Main'
import { randomMac } from 'core/test/randomMac'
import { randomRobot } from 'core/test/randomRobot'

export const GameControllers = () => {
	const {
		thingName: gameControllerThing,
		report,
		reportDesired,
		reset,
		resetAdmin,
	} = useGameControllerThing()

	// TODO: explain how the user can select a game controller
	if (gameControllerThing === undefined)
		return (
			<Main>
				<div className="alert alert-danger">
					Help! No game controller selected!
				</div>
			</Main>
		)

	return (
		<Main>
			<div className="card">
				<div className="card-header">Steps</div>
				<div className="card-body">
					<ol>
						<li>Write discovered robots to the GameController's shadow</li>
						<button
							className="btn btn-primary"
							onClick={() => {
								const robots: Parameters<typeof report>[0] = {}
								for (let i = 0; i < 8; i++) {
									robots[randomMac()] = randomRobot()
								}
								report(robots)
							}}
						>
							report random robots
						</button>
						<li> Set angle and drivetime in Game page </li>
						<li> Robot gets the desired values, and reports back</li>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => {
								reportDesired()
							}}
						>
							report desired values back
						</button>
						<li>Place robots in admin page</li>
					</ol>
					<p>Repeat step 2,3 and 4 to go through the game</p>
				</div>
			</div>
			<div className="card mt-4">
				<div className="card-header">Steps</div>
				<div className="card-body">
					<p>
						<button
							type="button"
							className="btn btn-danger"
							onClick={() => {
								reset()
							}}
						>
							Reset GameController Shadow
						</button>
					</p>
					<p>
						<button
							type="button"
							className="btn btn-danger"
							onClick={() => {
								resetAdmin()
							}}
						>
							Reset Admin Shadow
						</button>
					</p>
				</div>
			</div>
		</Main>
	)
}
