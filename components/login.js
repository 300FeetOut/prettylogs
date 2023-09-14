import styles from './login.module.sass'

import Link from 'next/link'

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
				<Link href="/api/auth/login">Log in</Link>
			</div>
		</div>
	)
}