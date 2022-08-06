import {useUser} from '@auth0/nextjs-auth0'
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import Logs from '../components/logs'


export default function Index() {
	const { user, error, isLoading } = useUser()

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>{error.message}</div>

	const queryClient = new QueryClient()

	if (user) {
		return (
			<QueryClientProvider client={queryClient}>
				Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
				<Logs project="62ed7a325c3793613596ffe7" />
			</QueryClientProvider>
		)
	}

	return <a href="/api/auth/login">Login</a>
}