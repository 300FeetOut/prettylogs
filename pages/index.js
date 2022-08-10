import {useUser} from '@auth0/nextjs-auth0'
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import Logs from '../components/logs'
import Header from '../components/header'
import Login from '../components/login'

import { decrypt, encrypt } from '../lib/encryption'

export default function Index() {
	const { user, error, isLoading } = useUser()

	// const encrypted = encrypt('google-oauth2|111822682839916165003')
	// console.log('decrypted', decrypt(encrypted))

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>{error.message}</div>

	const queryClient = new QueryClient()

	if (user) {
		return (
			<QueryClientProvider client={queryClient}>
				<Header user={user}></Header>
				<Logs project="62ed7a325c3793613596ffe7" />
			</QueryClientProvider>
		)
	}

	return <Login></Login>
}