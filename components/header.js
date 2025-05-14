import { useState } from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import styles from './header.module.sass'

import config from '../config'

import Link from 'next/link'

import { encrypt } from '@/lib/encryption'

export default function Header({level, user, updateRegex, negateRegex, updateLevels}) {
	const [levels, setLevels] = useState(config.levels)

	function changeLevels(level) {
		levels[level] = !levels[level]
		setLevels({...levels})
		updateLevels(levels)
	}

	return (
		<div className={styles.header}>
			<ul className={styles.levels}>
				{Object.keys(levels).map((level) => {
					return <li onClick={changeLevels.bind(null, level)} key={level} className={classNames(styles[`${level}_level`], levels[level] ? styles.active : '')}><span>{level}</span></li>
				})}
			</ul>

			<div className={styles.search}>
				<input placeholder="Search" onChange={updateRegex} className={styles.regex} type="text" />
				<label>Negate <input onChange={negateRegex} className={styles.negate} type="checkbox" /></label>
			</div>

			{user && <div className={styles.user}>
				<Link href="/auth/logout">Logout</Link>
				<input title="Auth key" readOnly type="text" className={styles.key} value={encrypt(user.sub)} onFocus={(e) => {
					e.target.select()
				}} onMouseUp={() => {return false}} />
			</div>}
		</div>
	)
}