import { Main } from 'components/Main'
import React, { useState } from 'react'

export const Settings = () => {
	const [accessKey, setAccessKey] = useState<string | null>(null)
	const [privateAccessKey, setprivateAccessKey] = useState<string | null>(null)

	const onSubmitAccessKey = () => {
		localStorage.setItem('accessKey', accessKey ?? '')
	}
	const onSubmitPrivateAccessKey = () => {
		localStorage.setItem('privateAccessKey', privateAccessKey ?? '')
	}

	return (
		<Main>
			<div className="card">
				<div className="card-header">User input</div>
				<div className="card-body">
					<p>This page is used for user input for connecting to AWS.</p>
					<p>
						Please enter your <code>AWS ACCESS KEY ID</code>:<br></br>
						<input
							type="text"
							placeholder={localStorage.getItem('accessKey') ?? ''}
							name="awsAccessKeyId"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setAccessKey(e.target.value)
							}
						/>
						<button onClick={onSubmitAccessKey}>SUBMIT</button>
					</p>
					<p>
						Please enter your <code>AWS SECRET ACCESS KEY</code>:<br></br>
						<input
							type="text"
							placeholder={localStorage.getItem('privateAccessKey') ?? ''}
							name="awsPrivateAccessKey"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setprivateAccessKey(e.target.value)
							}
						/>
						<button onClick={onSubmitPrivateAccessKey}>SUBMIT</button>
					</p>
				</div>
			</div>
		</Main>
	)
}
