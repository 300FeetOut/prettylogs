import { useState } from 'react'
import classNames from 'classnames'

import styles from './header.module.sass'

export default function Header({level, user}) {
	const [formFilter, setFormFilter] = useState({})
	const [collapseFilters, setCollapseFilters] = useState(true)

	const levels = ['info', 'notice', 'warning', 'error', 'critical']

	const savedFilters = []

	function applyFilter() {

	}

	function editFilter() {

	}

	function deleteFilter() {

	}

	function saveFilter() {
		console.log('save')
	}

	return (
		<div className={styles.header}>
			<ul className={styles.levels}>
				{levels.map((level) => {
					return <li key={level} className={classNames(styles[`${level}_level`], levels.indexOf(level) > -1 ? styles.active : '')}><span>{level}</span></li>
				})}
			</ul>

			<div className={styles.regex_filters}>
				<div className={styles.drawer}>
					<header>
						<div className={styles.regex}>Regex</div>
						<div className={styles.negate}>Negate</div>
					</header>
					<ul className={classNames(collapseFilters ? styles.collapsed : '', styles.saved)}>
						{savedFilters && savedFilters.map((filter) => {
							return <li key={filter.regex}>
								<div className={styles.regex} onClick={applyFilter.bind(null, filter)}>
									{filter.regex}
								</div>
								<input type="checkbox" onClick={toggleNegate.bind(null, filter)} />
								<div className={styles.edit} onClick={editFilter.bind(null, filter)}></div>
								<div className={styles.delete} onClick={deleteFilter.bind(null, filter)}></div>
							</li>
						})}
					</ul>

					<form className={styles.realtime} onSubmit={saveFilter}>
						<input className={styles.regex} type="text" />
						<input className={styles.negate} type="checkbox" />
						<input className={classNames(styles.button)} type="button" value="save" />
					</form>

					<div className={classNames(!collapseFilters ? styles.open : '', styles.drawer_toggle)} onClick={setCollapseFilters.bind(null, !collapseFilters)}></div>
				</div>
			</div>

			{user && <div className={styles.user}>
				<a href="/api/auth/logout">Logout</a>
				<input title="Auth key" readOnly type="text" className={styles.key} value={user.key} onFocus={(e) => {
					e.target.select()
				}} onMouseUp={() => {return false}} />
			</div>}
		</div>
	)
}