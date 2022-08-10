import classNames from "classnames"
import {useEffect, useRef} from "react"
import {filePath} from '/lib/filters'
import _ from 'lodash'
import moment from "moment"
import styles from './logs.module.sass'
import config from '/config.js'

import prettyPrint from "../lib/prettyPrint"

function Logs({logs, refetch, regex, negateRegex, levels}) {
	const logsRef = useRef(null)

	useEffect(() => {
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
			}
		}

		logsRef.current.addEventListener('click', onClick)

		const interval = setInterval(() => {
			if (!logsRef || !logsRef.current) {
				return
			}
	
			const logs = [...logsRef.current.querySelectorAll(`.${styles.log}`)]
			const now = Date.now()
	
			logs.length && logs.map((log) => {
				const percent = (now - log.dataset.created) / (1000 * 60 * 5 /*5 minutes*/)
				log.style.opacity = 1 - percent
			})
		}, 1000)

		return () => {
			logsRef.current.removeEventListener('click', onClick)
			clearInterval(interval)
		}
	},[])


	async function pin(log) {
		const response = await fetch(`/api/pin?_id=${log._id}&pin=${log.pinned ? 0 : 1}`)
		const responseJson = await response.json()
		refetch()
	}


	function toggleStackTrace(e) {
		const element = _.find(e.nativeEvent.path, (elem) => {
			return elem.classList.contains(styles.stack_trace)
		})

		if (element) {
			if (element.classList.contains(styles.expand)) {
				element.classList.remove(styles.expand)
			} else {
				element.classList.add(styles.expand)
			}
		}
	}

	function prepareLog(log) {
		const created = moment.unix(log.created/1000 - 60)

		log.prepared = {
			date: moment().isSame(created, 'day') ? 'Today at ' : created.format(config.date_format),
			time: created.format(config.time_format),
			from_now: created.fromNow()
		}

		try {
			log.stack_trace = log.stack_trace.reverse()
		} catch (e) {
			log.stack_trace = null
		}

		try {
			log.message = JSON.parse(log.message)
		} catch (e) {
		}
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
			prepareLog(log)

			if (!matchesRegex(log) || !levels[log.level]) {
				return ''
			}

			return <div data-created={log.created} key={log._id} className={classNames(styles.log, styles[log.level])}>
				<div className={styles.pin} title="Pin this log message" onClick={pin.bind(null, log)}>Pin</div>

				<div className={styles.timestamp}>
					<span className={styles.date}>{log.prepared.date}</span>
					<span className={styles.time}>{log.prepared.time}</span>
					<span className={styles.from_now}>{log.prepared.from_now}</span>
				</div>

				<div className={styles.referrer}>
					{log.referrer}
				</div>

				{log.stack_trace && !!log.stack_trace.length && <div onClick={toggleStackTrace} title="Expand stack" className={classNames(styles.stack_trace)}>
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
					<div className={styles.expand_stack}>expand</div>
				</div>}

				<div className={styles.message} dangerouslySetInnerHTML={{__html: prettyPrint(log.message, styles)}}></div>
			</div>
		})}
	</div>
}

export default Logs