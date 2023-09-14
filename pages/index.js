import { useState } from 'react'
import {useUser} from '@auth0/nextjs-auth0/client'
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query"

import config from '../config'
import Header from '../components/header'
import Login from '../components/login'

import LogsWrapper from '../components/logsWrapper'

import styles from './index.module.sass'

export default function Index() {
	const {user, error, isLoading} = useUser()
	const [regex, setRegex] = useState(null)
	const [negated, setNegated] = useState(null)
	const [levels, setLevels] = useState(config.levels)

	if (isLoading) return <div className={styles.loading}>Loading...</div>
	if (error) return <div className={styles.error}>{error.message}</div>

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
				<LogsWrapper regex={regex} negateRegex={negated} levels={levels}></LogsWrapper>
			</QueryClientProvider>
		)
	}

	return <Login></Login>
}