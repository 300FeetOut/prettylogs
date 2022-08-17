import React from 'react'
import {UserProvider} from '@auth0/nextjs-auth0'

import '../styles/globals.sass'

export default function App({Component, pageProps}) {
	return (
		<React.StrictMode>
			<UserProvider>
				<Component {...pageProps} />
			</UserProvider>
		</React.StrictMode>
	)
}