import { Main } from 'components/Main'
import { useAppConfig } from 'hooks/useAppConfig'
import React from 'react'

export const About = () => {
	const { version, homepage } = useAppConfig()

	return (
		<Main>
			<div className="card">
				<div className="card-header">About</div>
				<div className="card-body">
					<p>
						This is the web application of the <em>nRF Robot Wars</em>. You can
						find the source code on{' '}
						<a
							href={homepage.toString()}
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</a>
						.
					</p>
					<dl>
						<dt>Version</dt>
						<dd>
							<code>{version}</code>
						</dd>
					</dl>
				</div>
			</div>
			<div className="card mt-4">
				<div className="card-header">Environment</div>
				<div className="card-body">
					<dl>
						{Object.entries(import.meta.env).map(([k, v]) => (
							<React.Fragment key={k}>
								<dt>{k}</dt>
								<dd>
									<code>
										{v === undefined
											? 'N/A'
											: typeof v === 'string'
											? v
											: JSON.stringify(v)}
									</code>
								</dd>
							</React.Fragment>
						))}
					</dl>
				</div>
			</div>
		</Main>
	)
}
