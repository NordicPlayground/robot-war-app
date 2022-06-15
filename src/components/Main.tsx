import type { FunctionComponent, PropsWithChildren } from 'react'

export const Main: FunctionComponent<PropsWithChildren<unknown>> = ({
	children,
}) => (
	<main className="container mb-4">
		<div className="row justify-content-center">
			<div className="col-md-10 col-lg-8 col-xl-6">{children}</div>
		</div>
	</main>
)
