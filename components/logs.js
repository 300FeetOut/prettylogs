import classNames from "classnames"
import {useEffect, useRef} from "react"
import {filePath} from '/lib/filters'
import _ from 'lodash'
import moment from "moment"
import styles from './logs.module.sass'
import config from '/config.js'

import {
	useQuery,
} from "@tanstack/react-query"

import prettyPrint from "../lib/prettyPrint"

function Logs({refetch, regex, negateRegex, levels, pinned, logs}) {
	const logsRef = useRef(null)
	const stackTraceRef = useRef(null)

	useEffect(() => {
		const logWrapper = logsRef.current

		function onClick(e) {
			const target = e.target

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

		logWrapper.addEventListener('click', onClick)

		let interval = null
		if (!pinned) {
			interval = setInterval(() => {
				if (!logsRef || !logWrapper) {
					return
				}
		
				const logs = [...logWrapper.querySelectorAll(`.${styles.log}`)]
				const now = Date.now()
		
				logs.length && logs.map((log) => {
					const percent = (now - log.dataset.created) / (1000 * 60 * 5 /*5 minutes*/)
					log.style.opacity = Math.max(.3, 1 - percent)
				})
			}, 1000)
		}

		return () => {
			logWrapper.removeEventListener('click', onClick)
			clearInterval(interval)
		}
	}, [])

	async function pin(log) {
		const response = await fetch(`/api/pin?_id=${log._id}&pin=${log.pinned ? 0 : 1}`)
		const responseJson = await response.json()
		refetch()
	}

	function toggleStackTrace(e) {
		stackTraceRef.current.classList.toggle(styles.expand)
	}

	function prepareLog(log) {
		const preparedLog = {...log}
		const created = moment.unix(preparedLog.created/1000 - 60)

		preparedLog.prepared = {
			date: moment().isSame(created, 'day') ? 'Today at ' : created.format(config.date_format),
			time: created.format(config.time_format),
			from_now: created.fromNow()
		}

		// preparedLog.stack_trace = [...preparedLog.stack_trace]
		// try {
		// 	preparedLog.stack_trace = preparedLog.stack_trace.reverse()
		// } catch (e) {
		// 	preparedLog.stack_trace = null
		// }

		try {
			preparedLog.message = JSON.parse(log.message)
		} catch (e) {
		}

		return preparedLog
	}

	function matchesRegex(log) {
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
	
	return <div ref={logsRef}>
		{logs && logs.map((log) => {
			const preparedLog = prepareLog(log)

			if (!matchesRegex(preparedLog) || (!pinned && !levels[preparedLog.level])) {
				return ''
			}

			return <div data-created={preparedLog.created} key={preparedLog._id} className={classNames(styles.log, styles[preparedLog.level], styles.pinned)}>
				<div className={styles.pin} title={pinned ? "Unpin" : "Pin this log message"} onClick={pin.bind(null, preparedLog)}>Pin</div>

				<div className={styles.timestamp}>
					<span className={styles.date}>{preparedLog.prepared.date}</span>
					<span className={styles.time}>{preparedLog.prepared.time}</span>
					<span className={styles.from_now}>{preparedLog.prepared.from_now}</span>
				</div>

				<div className={styles.referrer}>
					{preparedLog.referrer}
				</div>

				{preparedLog.stack_trace && !!preparedLog.stack_trace.length && <div ref={stackTraceRef} onClick={toggleStackTrace} title="Expand stack" className={classNames(styles.stack_trace)}>
					{preparedLog.stack_trace.map((trace, i) => {
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
					<div className={styles.expand_stack}>expand</div>
				</div>}

				<div className={styles.message} dangerouslySetInnerHTML={{__html: prettyPrint(preparedLog.message, styles)}}></div>
			</div>
		})}
	</div>
}

export default Logs