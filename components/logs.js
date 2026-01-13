import classNames from "classnames"
import {useEffect, useRef, useState, memo, useCallback, useMemo} from "react"
import {filePath} from '/lib/filters'
import _ from 'lodash'
import moment from "moment"
import styles from './logs.module.sass'
import config from '/config.js'

import {
	useQuery,
} from "@tanstack/react-query"

import prettyPrint from "../lib/prettyPrint"

// Helper functions moved outside component
function prepareLog(log) {
	const preparedLog = {...log}
	const created = moment.unix(preparedLog.created/1000 - 60)

	preparedLog.prepared = {
		date: moment().isSame(created, 'day') ? 'Today at ' : created.format(config.date_format),
		time: created.format(config.time_format),
		from_now: created.fromNow()
	}

	try {
		preparedLog.message = JSON.parse(log.message)
	} catch (e) {
	}

	return preparedLog
}

function matchesRegex(log, regex, negateRegex) {
	if (!regex) {
		return true
	}
	
	const activeRegex = new RegExp(regex, 'gim')

	let message = ''
	if (typeof log.message == 'object') {
		message = JSON.stringify(log.message)
	} else {
		message = new String(log.message)
	}

	let matches = false
	matches = message.match(activeRegex)
	if (matches) {
		if (negateRegex) {
			return false
		}
		return true
	} else {
		if (negateRegex) {
			return true
		}			
		return false
	}
}

// Memoized individual log item component
const LogItem = memo(function LogItem({ log, styles, onPin, pinned }) {
	const [stackTraceExpanded, setStackTraceExpanded] = useState(false)
	const logRef = useRef(null)

	useEffect(() => {
		const logElement = logRef.current
		if (!logElement) return

		function onClick(e) {
			const target = e.target

			// Handle icon clicks within the prettyPrint output
			if (target.classList.contains(styles.icon)) {
				const nextSibling = target.parentNode.nextSibling

				if ([...target.parentNode.classList].indexOf(styles.collapsed) > -1) {
					target.parentNode.classList.remove(styles.collapsed)
					target.parentNode.classList.add(styles.expanded)
	
					if (nextSibling) {
						nextSibling.classList.remove(styles.collapsed)
						nextSibling.classList.add(styles.expanded)
					}
	
				} else {
					target.parentNode.classList.add(styles.collapsed)
					target.parentNode.classList.remove(styles.expanded)
	
					if (nextSibling) {
						nextSibling.classList.add(styles.collapsed)
						nextSibling.classList.remove(styles.expanded)
					}
				}
			} else if (target.classList.contains(styles.toggle)) {
				if (target.classList.contains(styles.expanded)) {
					target.previousSibling.classList.add(styles.collapsed)
					target.previousSibling.classList.remove(styles.expanded)
					target.classList.remove(styles.expanded)
				} else {
					target.previousSibling.classList.remove(styles.collapsed)
					target.previousSibling.classList.add(styles.expanded)
					target.classList.add(styles.expanded)
				}
			}
		}

		logElement.addEventListener('click', onClick)

		return () => {
			logElement.removeEventListener('click', onClick)
		}
	}, [styles])

	const preparedLog = prepareLog(log)

	return (
		<div 
			ref={logRef}
			data-created={preparedLog.created} 
			className={classNames(styles.log, styles[preparedLog.level], styles.pinned)}
		>
			<div className={styles.pin} title={pinned ? "Unpin" : "Pin this log message"} onClick={() => onPin(preparedLog)}>Pin</div>

			<div className={styles.timestamp}>
				<span className={styles.date}>{preparedLog.prepared.date}</span>
				<span className={styles.time}>{preparedLog.prepared.time}</span>
				<span className={styles.from_now}>{preparedLog.prepared.from_now}</span>
			</div>

			<div className={styles.referrer}>
				{preparedLog.referrer}
			</div>

			{preparedLog.stack_trace && !!preparedLog.stack_trace.length && (
				<div 
					onClick={() => setStackTraceExpanded(!stackTraceExpanded)} 
					title="Expand stack" 
					className={classNames(styles.stack_trace, stackTraceExpanded && styles.expand)}
				>
					{preparedLog.stack_trace.map((trace, i) => {
						return (
							<div key={i} className={styles.line}>
								<div className={styles.identifying_info}>
									<div className={styles.line_number}>{trace.line || '&nbsp;'}</div>
									{trace.file && <div className={styles.file_path}>{filePath(trace.file)}</div>}
									<div className={styles.function}>{trace.function}</div>
								</div>

								{trace.statement && (
									<div className={styles.statement}>
										{trace.statement}
									</div>
								)}
							</div>
						)
					})}
					<div className={styles.expand_stack}>expand</div>
				</div>
			)}

			<div className={styles.message} dangerouslySetInnerHTML={{__html: prettyPrint(preparedLog.message, styles)}}></div>
		</div>
	)
}, (prevProps, nextProps) => {
	// Custom comparison function for React.memo
	// Returns true if props are equal (skip re-render), false if different (re-render)
	// Only re-render if the log data actually changed
	if (prevProps.log._id !== nextProps.log._id || prevProps.pinned !== nextProps.pinned) {
		return false // Props are different, re-render
	}
	
	// Compare log data - if IDs are the same, assume same log object reference means no change
	// This relies on the logs array items maintaining reference equality when unchanged
	return prevProps.log === nextProps.log
})

function Logs({refetch, regex, negateRegex, levels, pinned, logs}) {
	const logsRef = useRef(null)

	useEffect(() => {
		const logWrapper = logsRef.current
		if (!logWrapper) return

		let interval = null
		if (!pinned) {
			interval = setInterval(() => {
				if (!logsRef || !logWrapper) {
					return
				}
		
				const logElements = [...logWrapper.querySelectorAll(`.${styles.log}`)]
				const now = Date.now()
		
				logElements.length && logElements.map((logElement) => {
					const percent = (now - logElement.dataset.created) / (1000 * 60 * 5 /*5 minutes*/)
					logElement.style.opacity = Math.max(.3, 1 - percent)
				})
			}, 1000)
		}

		return () => {
			clearInterval(interval)
		}
	}, [pinned, styles.log])

	const pin = useCallback(async (log) => {
		const response = await fetch(`/api/pin?_id=${log._id}&pin=${log.pinned ? 0 : 1}`)
		const responseJson = await response.json()
		refetch()
	}, [refetch])
	
	return (
		<div ref={logsRef}>
			{logs && logs.map((log) => {
				const preparedLog = prepareLog(log)

				if (!matchesRegex(preparedLog, regex, negateRegex) || (!pinned && !levels[preparedLog.level])) {
					return null
				}

				return (
					<LogItem 
						key={log._id}
						log={log}
						styles={styles}
						onPin={pin}
						pinned={pinned}
					/>
				)
			})}
		</div>
	)
}

export default Logs