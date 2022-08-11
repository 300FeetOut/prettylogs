import { useState } from "react"

import {
	useQuery,
} from "@tanstack/react-query"
import _ from 'lodash'
import styles from './logsWrapper.module.sass'

import Logs from '../components/logs'
import Projects from "./projects"

function LogsWrapper({regex, negateRegex, levels}) {
	const [project, setProject] = useState(null)

	async function fetchLogs() {
		const response = await fetch(`/api/logs?project=${project}&pinned=0`)
		return await response.json()
	}

	async function fetchPinnedLogs() {
		const response = await fetch(`/api/logs?project=${project}&pinned=1`)
		return await response.json()
	}

	const logsQuery = useQuery(['logs'], fetchLogs, {
		refetchInterval: 500,
		enabled: !!project
	})
	const pinnedLogsQuery = useQuery(['pinnedLogs'], fetchPinnedLogs, {
		enabled: !!project
	})

	function refetch() {
		logsQuery.refetch()
		pinnedLogsQuery.refetch()
	}	

	return <div className={styles.logs_wrapper}>
		<Projects projectSelected={(project) => {setProject(project)}}></Projects>
		<div className={styles.logs}>
			<Logs logs={logsQuery.data} pinned={false} refetch={refetch} regex={regex} negateRegex={negateRegex} levels={levels} />
		</div>
		<div className={styles.pinned_logs}>
			<Logs logs={pinnedLogsQuery.data} pinned={true} refetch={refetch} regex={regex} negateRegex={negateRegex} levels={levels} />
		</div>
	</div>
}

export default LogsWrapper