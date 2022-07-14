import { useCore } from 'hooks/useCore.js'
import type { FunctionComponent } from 'react'

export const SampleCoreComponent: FunctionComponent = () => {
	const { robots: visibleRobots } = useCore()

	const robots = Object.entries(visibleRobots)

	if (robots.length === 0)
		return <p className="alert alert-warning">No robots discovered!</p>

	return (
		<ul className="robots">
			{robots.map(([address]) => (
				<li key={address}>{address}</li>
			))}
		</ul>
	)
}
