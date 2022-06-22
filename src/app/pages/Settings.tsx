import { Main } from 'components/Main'
import { useCredentials } from 'hooks/useCredentials'
import React, { useState } from 'react'

export const Settings = () => {
	const [accessKeyId, setAccessKeyId] = useState<string>(
		localStorage.getItem('accessKey') ?? '',
	)
	const [secretAccessKey, setSecretAccessKey] = useState<string>(
		localStorage.getItem('privateAccessKey') ?? '',
	)

	const { updateCredentials } = useCredentials()

	const save = () => {
		updateCredentials({
			accessKeyId,
			secretAccessKey,
		})
	}

	const isFormValid =
		/^[A-Z0-9]{16,}$/.test(accessKeyId) && /.{32,}/.test(secretAccessKey)

	return (
		<Main>
			<form
				className="card"
				onSubmit={(e) => {
					e.preventDefault()
				}}
			>
				<div className="card-header">User input</div>
				<div className="card-body">
					<p>This page is used for user input for connecting to AWS.</p>
					<p>
						Please enter your AWS access key ID:<br></br>
						<input
							type="text"
							name="awsAccessKeyId"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setAccessKeyId(e.target.value)
							}
							value={accessKeyId}
							autoComplete={'off'}
						/>
					</p>
					<p>
						Please enter your AWS secret access key:<br></br>
						<input
							type="password"
							name="awsPrivateAccessKey"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setSecretAccessKey(e.target.value)
							}
							value={secretAccessKey}
							autoComplete={'off'}
						/>
					</p>
				</div>
				<footer className="card-footer">
					<button
						type="button"
						className="btn btn-primary"
						onClick={save}
						disabled={!isFormValid}
					>
						save
					</button>
				</footer>
			</form>
		</Main>
	)
}
