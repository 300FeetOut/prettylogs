import classNames from "classnames"

import {useEffect, useRef} from "react"

import {
	useQuery,
} from "@tanstack/react-query"

import {filePath} from '/lib/filters'

import styles from './logs.module.sass'

import {useUser} from '@auth0/nextjs-auth0'

import config from '/config.js'

import moment from "moment"

function prettyPrint(thing, wrap_quotes, depth) {
	function render(thing, wrap_quotes = false, depth = 0) {
		if (thing === null) {
			return 'null'
		}

		const type = getType(thing)

		if (type == 'array' || type == 'object') {
			return renderObject(thing, depth, 0)
		}

		thing = new String(thing)
		const encoded_thing = encodeHtmlEntity(thing)

		if (depth == 0) {
			return '<div class="text">' + encoded_thing + '</div>'
		} else {
			if (wrap_quotes) {
				return '"' + encoded_thing + '"'
			} else {
				return encoded_thing + ''
			}
		}
	}

	function encodeHtmlEntity(str) {
		const buf = []
		for (var i = 0; i < str.length; i++) {
			buf.push(['&#', str.charCodeAt(i), ';'].join(''))
		}
		
		return buf.join('')
	}

	function truncate(thing, length) {
		return thing.substring(0, length)
	}

	function getType(thing) {
		if (thing === null) {
			return 'null'
		}

		if (thing instanceof Array) {
			return 'array'
		}

		if (thing instanceof Object) {
			return 'object'
		}

		return 'string'
	}

	function renderObject(object, depth, length) {
		let rendered_object = []
		const type = getType(object)

		for (let [key, value] of Object.entries(object)) {
			const child_type = getType(value)
			let empty = ''

			if ((child_type == 'object' && !Object.keys(value).length) || (child_type == 'array' && !value.length)) {
				empty = 'empty'
			}

			const label = `<div class="${styles.key} ${styles.collapsed} ${styles[child_type] || ''} ${styles[empty] || ''}">` + key + `:<div class="${styles.icon}"></div></div>`
			if (child_type == 'string' || child_type == 'null') {
				value = `<div class="${styles.value}">` + render(value, true, depth+1) + `<span class="${styles.comma}">,</span></div>`
			} else { // Render objects/arrays without a value wrapper
				value = render(value, true, depth+1)
			}
			rendered_object.push('<li>' + label + value + '</li>')
		}

		rendered_object = `<ul ng-click="test()" class="${styles.rendered} ${styles.collapsed} ${styles[type]}">` + rendered_object.join('') + '</ul>'

		let toggle_button = ''
		if (depth == 0 && Object.keys(object).length > 3) {
			toggle_button = `<div class="${styles.toggle}"></div>`
		}

		return rendered_object + toggle_button
	}

	return render(thing, wrap_quotes, depth)
}

function Logs({project}) {
	const {user, error, isLoading} = useUser()
	const logsRef = useRef(null)

	async function fetchLogs() {
		const response = await fetch(`/api/logs?project=${project}`)
		return await response.json()
	}

	const {data, status} = useQuery(['logs'], fetchLogs)

	useEffect(() => {
		console.log(logsRef)

		function onClick(e) {
			const target = e.target
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

		logsRef.current.addEventListener('click', onClick)

		return () => {
			logsRef.current.removeEventListener('click', onClick)
		}
	},[])


	function pin(log) {
		console.log('pin', log)
	}


	function prepareLog(log) {
		const created = moment.unix(log.created/1000 - 60)

		log.prepared = {
			date: moment().isSame(created, 'day') ? 'Today at ' : created.format(config.date_format),
			time: created.format(config.time_format),
			from_now: created.fromNow()
		}

		try {
			console.log(log.stack_trace)
			log.stack_trace = log.stack_trace.reverse()
		} catch (e) {
			log.stack_trace = null
		}

		try {
			log.message = JSON.parse(log.message)
		} catch (e) {
		}
	}

	return <div ref={logsRef}>
		<h1>The logs</h1>

		{data && data.map((log) => {
			prepareLog(log)
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

				<div className={styles.message} dangerouslySetInnerHTML={{__html: prettyPrint(log.message)}}></div>
			</div>
		})}
	</div>
}

export default Logs