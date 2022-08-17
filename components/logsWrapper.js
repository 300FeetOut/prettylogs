import { useState, useEffect } from "react"

import {
	useQuery,
} from "@tanstack/react-query"
import _ from 'lodash'
import styles from './logsWrapper.module.sass'

import Logs from '../components/logs'
import Projects from "./projects"

function LogsWrapper({regex, negateRegex, levels}) {
	const [project, setProject] = useState(null)
	const [lastRefresh, setLastRefresh] = useState(Date.now())
	const [clearing, setClearing] = useState(false)

	async function fetchLogs() {
		if (!project) {
			return []
		}
		const response = await fetch(`/api/logs?project=${project}&pinned=0&lastRefresh=${lastRefresh}`)
		return await response.json()
	}

	async function fetchPinnedLogs() {
		if (!project) {
			return []
		}
		const response = await fetch(`/api/logs?project=${project}&pinned=1`)
		return await response.json()
	}

	const pinnedLogsQuery = useQuery(['pinnedLogs', project], fetchPinnedLogs, {
		refetchInterval: false,
	})

	const logsQuery = useQuery(['logs', project], fetchLogs, {
		refetchInterval: 500
	})

	function refetch() {
		logsQuery.refetch()
		pinnedLogsQuery.refetch()
	}

	useEffect(refetch, [project])

	return <div className={styles.logs_wrapper}>
		<div className={styles.logs_header}>
			<Projects projectSelected={(project) => {
				setProject(project)
			}}></Projects>
			<button title="Clear" className={styles.refresh} onClick={() => {
				setLastRefresh(Date.now())
				setClearing(true)
			}}>Refresh</button>
		</div>
		<div className={styles.columns}>
			<div className={styles.logs}>
				{!clearing && <Logs logs={logsQuery.data} pinned={false} refetch={refetch} regex={regex} negateRegex={negateRegex} levels={levels} />}
			</div>
			<div className={styles.pinned_logs}>
				<Logs logs={pinnedLogsQuery.data} pinned={true} refetch={refetch} regex={regex} negateRegex={negateRegex} levels={levels} />
			</div>
		</div>
	</div>
}

export default LogsWrapper