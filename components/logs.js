import classNames from "classnames"

import {
	useQuery,
} from "@tanstack/react-query"

import {filePath} from '/lib/filters'

import styles from './logs.module.sass'

function Logs({project}) {

	async function fetchLogs() {
		const response = await fetch(`/api/logs?project=${project}`)
		return await response.json()
	}

	const {data, status} = useQuery(['logs'], fetchLogs)

	function pin(log) {
		console.log('pin', log)
	}

	return <div>
		<h1>The logs</h1>
		<p>status: {status}</p>

		{data && data.map((log) => {
			log.prepared = {}
			return <div key={log._id} className={styles.log}>
				<a className={styles.pin} title="Pin this log message" onClick={pin.bind(null, log)}>Pin</a>

				<div className={styles.timestamp}>
					<span className={styles.date}>{log.prepared.date}</span>
					<span className={styles.time}>{log.prepared.time}</span>
					<span className={styles.from_now}>{log.prepared.from_now}</span>
				</div>

				<div className={styles.referrer}>
					{log.referrer}
				</div>

				{log.stack_trace && log.stack_trace.length && <div className={classNames(styles.stack_trace, styles.collapsed)}>
					{log.stack_trace.map((trace, i) => {
						return <div key={i} className={styles.line}>
							<div className={styles.identifying_info}>
								<div className={styles.line_number}>{trace.line || '&nbsp;'}</div>
								{trace.file && <div className={styles.file_path}>{filePath(trace.file)}</div>}
								<div className={styles.function}>{trace.function}</div>
							</div>

							{trace.statement && <div className={styles.statement}>
								{trace.statement}
							</div>}
						</div>
					})}
				</div>}

				<div className={styles.message}>
					{log.message}
					{/* investigate Pretty-print filter */}
				</div>
			</div>
		})}
	</div>
}

export default Logs