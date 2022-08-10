import { useState } from 'react'
import {useUser} from '@auth0/nextjs-auth0'
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query"

import config from '../config'
import Header from '../components/header'
import Login from '../components/login'

import LogsWrapper from '../components/logsWrapper'

export default function Index() {
	const { user, error, isLoading } = useUser()
	const [regex, setRegex] = useState(null)
	const [negated, setNegated] = useState(null)
	const [levels, setLevels] = useState(config.levels)

	// const encrypted = encrypt('google-oauth2|111822682839916165003')
	// console.log('decrypted', decrypt(encrypted))

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>{error.message}</div>

	const queryClient = new QueryClient()

	function updateRegex(e) {
		const regex = e.target.value
		setRegex(regex)
	}

	function negateRegex(e) {
		const negated = e.target.checked
		setNegated(negated)
	}

	function updateLevels(levels) {
		setLevels(levels)
	}

	if (user) {
		return (
			<QueryClientProvider client={queryClient}>
				<Header user={user} updateRegex={updateRegex} negateRegex={negateRegex} updateLevels={updateLevels}></Header>
				<LogsWrapper project="62ed7a325c3793613596ffe7" regex={regex} negateRegex={negated} levels={levels}></LogsWrapper>
			</QueryClientProvider>
		)
	}

	return <Login></Login>
}