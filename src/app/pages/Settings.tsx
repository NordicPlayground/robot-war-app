import { useCredentials } from 'api/hooks/useCredentials.js'
import { useGameControllerThing } from 'api/hooks/useGameControllerThing'
import { useGameControllerThings } from 'api/hooks/useGameControllerThings'
import { InvisibleIcon, VisibleIcon } from 'components/FeatherIcon'
import { Main } from 'components/Main'
import { useAppConfig } from 'hooks/useAppConfig'
import React, { useState } from 'react'

export const Settings = () => {
	const gameControllers = useGameControllerThings()
	const { setGameController, thingName } = useGameControllerThing()
	const {
		updateCredentials,
		accessKeyId: storedAccessKeyId,
		secretAccessKey: storedSecretAccessKey,
	} = useCredentials()
	const {
		autoUpdateEnabled,
		enableAutoUpdate,
		autoUpdateIntervalSeconds,
		setAutoUpdateIntervalSeconds,
	} = useAppConfig()
	const [accessKeyId, setAccessKeyId] = useState<string>(
		storedAccessKeyId ?? '',
	)
	const [secretAccessKey, setSecretAccessKey] = useState<string>(
		storedSecretAccessKey ?? '',
	)
	const [showPassword, setShowPassword] = useState<boolean>(false)

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
				<div className="card-header">Application settings</div>
				<div className="card-body">
					<fieldset>
						<legend>AWS access key</legend>
						<div>
							<label htmlFor="awsAccessKeyId">
								Please enter your AWS access key ID:
							</label>
							<input
								type="text"
								id="awsAccessKeyId"
								name="awsAccessKeyId"
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setAccessKeyId(e.target.value)
								}
								value={accessKeyId}
								autoComplete={'off'}
								className={'form-control'}
							/>
						</div>
						<div className="mt-2">
							<label htmlFor="awsPrivateAccessKey">
								Please enter your AWS secret access key:
							</label>
							<div className="input-group">
								<input
									type={showPassword ? 'text' : 'password'}
									name="awsPrivateAccessKey"
									id="awsPrivateAccessKey"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setSecretAccessKey(e.target.value)
									}
									value={secretAccessKey}
									autoComplete={'off'}
									className={'form-control'}
								/>
								{showPassword ? (
									<button
										className="btn btn-outline-secondary"
										type="button"
										title="hide password"
										onClick={() => setShowPassword((show) => !show)}
									>
										<InvisibleIcon />
									</button>
								) : (
									<button
										className="btn btn-outline-secondary"
										type="button"
										title="show password"
										onClick={() => setShowPassword((show) => !show)}
									>
										<VisibleIcon />
									</button>
								)}
							</div>
						</div>
					</fieldset>
					<fieldset className="mt-4">
						<legend>Game Controller</legend>
						<select
							className="form-select form-select-lg"
							onChange={(e) => {
								setGameController(e.target.value)
							}}
							value={thingName}
						>
							{gameControllers.map((name) => (
								<option key={name}>{name}</option>
							))}
						</select>
					</fieldset>
					<fieldset className="mt-4">
						<legend>Auto-updated</legend>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								value={'true'}
								checked={autoUpdateEnabled}
								id="enableAutoUpdate"
								onChange={({ target: { checked } }) =>
									enableAutoUpdate(checked)
								}
							/>
							<label className="form-check-label" htmlFor="enableAutoUpdate">
								Enable auto-updated?
							</label>
						</div>
						<div className="mt-2">
							<label htmlFor="autoUpdateInterval" className="form-label">
								Auto-update interval
							</label>
							<div className="input-group">
								<input
									type="number"
									step={'60'}
									min={'1'}
									className="form-control"
									id="autoUpdateInterval"
									placeholder={`e.g. "${autoUpdateIntervalSeconds}"`}
									value={autoUpdateIntervalSeconds.toString()}
									onChange={({ target: { value } }) =>
										setAutoUpdateIntervalSeconds(parseInt(value, 10))
									}
								/>
								<span
									className="input-group-text"
									id="autoUpdateInterval-addon"
								>
									seconds
								</span>
							</div>
						</div>
					</fieldset>
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
