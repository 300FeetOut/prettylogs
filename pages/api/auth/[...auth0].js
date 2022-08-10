import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'

import {encrypt} from '../../../lib/encryption'

const afterCallback = (req, res, session, state) => {
	session.user.key = encrypt(session.user.sub)
	delete session.refreshToken
	return session
}

export default handleAuth({
	async callback(req, res) {
		try {
			await handleCallback(req, res, {afterCallback})
		} catch (error) {
			res.status(error.status || 500).end(error.message)
		}
	}
})