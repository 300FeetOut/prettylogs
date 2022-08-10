import { useState } from 'react'
import classNames from 'classnames'

import styles from './login.module.sass'

export default function Login({level, user}) {
	return (
		<div className={styles.login}>
			<div className={styles.top}>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
			<div className={styles.login_content}>
				<a href="/api/auth/login">Log in</a>
			</div>
		</div>
	)
}