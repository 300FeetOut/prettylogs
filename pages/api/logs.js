import {ObjectId} from 'mongodb'

import getClient from '../../lib/getClient'

import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export default withApiAuthRequired(async function handler(req, res) {
	const session = await getSession(req, res)
	const user = session.user

	const projectId = req.query.project

	try {
		const client = await getClient()
		const db = client.db('Prettylogs')

		const query = {project: ObjectId(projectId), owner: user.sub}

		const cutoffSeconds = 1
		const cutoff = req.query.lastRefresh ? req.query.lastRefresh - (cutoffSeconds * 1000) : (Date.now() - (1000*60*cutoffSeconds))

		query.pinned = parseInt(req.query.pinned)
		if (query.pinned == 0) {
			query.created = {$gt: cutoff}
		}

		const logsCursor = await db.collection('logs').find(query)
		const logs = await logsCursor.toArray()

		client.close()
		
		return res.json(logs.reverse())
	} catch (e) {
		console.log(e)
		return res.status(500).send('An error occurred')
	}		
})