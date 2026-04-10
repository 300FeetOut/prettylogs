import { useState, useEffect, useRef } from "react"
import { createRoot } from 'react-dom/client'

import {
	useQuery,
} from "@tanstack/react-query"
import _, { last } from 'lodash'
import styles from './logsWrapper.module.sass'


import Logs from '../components/logs'
import Projects from "./projects"

function LogsWrapper({regex, negateRegex, levels}) {
	const [project, setProject] = useState(null)
	const [lastRefresh, setLastRefresh] = useState(Date.now())
	const [clearing, setClearing] = useState(false)
	const [pinnedLogs, setPinnedLogs] = useState([])

	async function fetchLogs() {
		if (!project) {
			return []
		}
		const response = await fetch(`/api/logs?project=${project}&pinned=0&lastRefresh=${lastRefresh}`)
		const responseJson = await response.json()
		if (clearing) {
			setClearing(false)
		}
		return responseJson
	}

	async function fetchPinnedLogs() {
		if (!project) {
			return []
		}
		const response = await fetch(`/api/logs?project=${project}&pinned=1`)
		return await response.json()
	}

	const pinnedLogsQuery = useQuery({
		queryKey: ['pinnedLogs', project],
		queryFn: fetchPinnedLogs,
		refetchInterval: false,
	})

	const logsQuery = useQuery({
		queryKey: ['logs', project],
		queryFn: fetchLogs,
		refetchInterval: () => {return clearing ? false : 500}
	})

	function refetch() {
		logsQuery.refetch()
		pinnedLogsQuery.refetch()
	}

	useEffect(() => {
		setClearing(true)
		logsQuery.refetch()
	}, [lastRefresh])

	useEffect(refetch, [project])

	useEffect(() => {
		if (logsQuery.data && logsQuery.data.length > 0) {
			console.log('logsQuery.data', logsQuery.data)
			const logsWrapper = document.getElementById('logs-wrapper')

			const oldBatches = logsWrapper.querySelectorAll(`.batch-container`)
			console.log('oldBatches', oldBatches)
			oldBatches.forEach((batch) => {
				if (Date.now() - batch.dataset.created > 60000) {
					console.log('removing batch', batch)
					batch.rootRef.unmount()
					batch.rootRef = null
					batch.remove()
				}
			})

			// Create a root for the log component
			let root = document.createElement('div')
			root.className = 'batch-container'
			root.dataset.created = Date.now()
			logsWrapper.prepend(root)
			root.rootRef = createRoot(root)

			const filteredLogs = logsQuery.data.filter((log) => {
				return logsWrapper.querySelector(`#log-${log._id}`) === null
			})

			console.log('filteredLogs', filteredLogs)

			root.rootRef.render(<Logs logs={filteredLogs} pinned={false} refetch={refetch} regex={regex} negateRegex={negateRegex} levels={levels} />)
		}
	}, [logsQuery.data])

	useEffect(() => {
		if (pinnedLogsQuery.data && JSON.stringify(pinnedLogsQuery.data) !== JSON.stringify(pinnedLogs)) {
			setPinnedLogs(pinnedLogsQuery.data)
		}
	}, [pinnedLogsQuery.data, pinnedLogs])

	return <div className={styles.logs_wrapper}>
		<div className={styles.logs_header}>
			<Projects projectSelected={(project) => {
				setProject(project)
			}}></Projects>
	 		<button title="Clear" className={styles.refresh} onClick={() => {
	 			setLastRefresh(Date.now())
	 		}}>Refresh</button>
	 	</div>
		<div className={styles.columns}>
			<div className={styles.logs}>
				<div id="logs-wrapper"></div>
			</div>
			<div className={styles.pinned_logs}>
				<Logs logs={pinnedLogs} pinned={true} refetch={refetch} regex={regex} negateRegex={negateRegex} levels={levels} />
			</div>
		</div>
	</div>

}

export default LogsWrapper