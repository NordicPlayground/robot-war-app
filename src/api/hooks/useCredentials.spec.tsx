/**
 * @jest-environment jsdom
 */
import {
	CredentialsContext,
	CredentialsProvider,
} from 'api/hooks/useCredentials.js'
import { isolateComponent } from 'isolate-react'

describe('useCredentials()', () => {
	describe('<CredentialsProvider/>', () => {
		it('should have no credentials by default, and the region from the property', () => {
			jest.spyOn(Storage.prototype, 'getItem')
			Storage.prototype.getItem = jest.fn(() => null)

			const isolated = isolateComponent(
				<CredentialsProvider region="eu-north-1">
					<CredentialsContext.Consumer>
						{({ accessKeyId, secretAccessKey, region }) => (
							<>
								<p>AccessKeyId: {accessKeyId ?? '-'}</p>
								<p>SecretAccessKey: {secretAccessKey ?? '-'}</p>
								<p>Region: {region}</p>
							</>
						)}
					</CredentialsContext.Consumer>
				</CredentialsProvider>,
			)

			isolated.inline('*')

			expect(isolated.content()).toContain('AccessKeyId: -')
			expect(isolated.content()).toContain('SecretAccessKey: -')
			expect(isolated.content()).toContain('Region: eu-north-1')
		})

		it('should allow to set credentials, and store them in localStorage', async () => {
			jest.spyOn(Storage.prototype, 'setItem')
			const setItem = jest.fn()
			Storage.prototype.setItem = setItem

			const isolated = isolateComponent(
				<CredentialsProvider>
					<CredentialsContext.Consumer>
						{({ accessKeyId, secretAccessKey, updateCredentials }) => (
							<>
								<p>AccessKeyId: {accessKeyId ?? '-'}</p>
								<p>SecretAccessKey: {secretAccessKey ?? '-'}</p>
								<button
									onClick={() => {
										updateCredentials({
											accessKeyId: 'myAccessKey',
											secretAccessKey: 'mySecretAccessKey',
										})
									}}
								>
									save
								</button>
							</>
						)}
					</CredentialsContext.Consumer>
				</CredentialsProvider>,
			)

			isolated.inline('*')

			isolated.findOne('button').props.onClick()

			expect(setItem).toHaveBeenCalledWith('accessKeyId', 'myAccessKey')
			expect(setItem).toHaveBeenCalledWith(
				'secretAccessKey',
				'mySecretAccessKey',
			)

			expect(isolated.content()).toContain('AccessKeyId: myAccessKey')
			expect(isolated.content()).toContain('SecretAccessKey: mySecretAccessKey')
		})

		it('should provide credentials from localStorage', () => {
			jest.spyOn(Storage.prototype, 'getItem')
			const getItem = jest.fn()
			getItem.mockImplementationOnce(() => 'myAccessKey')
			getItem.mockImplementationOnce(() => 'mySecretAccessKey')
			Storage.prototype.getItem = getItem

			const isolated = isolateComponent(
				<CredentialsProvider>
					<CredentialsContext.Consumer>
						{({ accessKeyId, secretAccessKey }) => (
							<>
								<p>AccessKeyId: {accessKeyId ?? '-'}</p>
								<p>SecretAccessKey: {secretAccessKey ?? '-'}</p>
							</>
						)}
					</CredentialsContext.Consumer>
				</CredentialsProvider>,
			)

			isolated.inline('*')

			expect(isolated.content()).toContain('AccessKeyId: myAccessKey')
			expect(isolated.content()).toContain('SecretAccessKey: mySecretAccessKey')
		})
	})
})
