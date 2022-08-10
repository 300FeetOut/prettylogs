import {ObjectId} from 'mongodb'

import getClient from '../../lib/getClient'

import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export default withApiAuthRequired(async function handler(req, res) {
	const session = getSession(req, res)
	const user = session.user


	const projectId = req.query.project

	const client = await getClient()
	const db = client.db('Prettylogs')

	const logsCursor = await db.collection('logs').find({project: ObjectId(projectId), owner: user.sub})
	const logs = await logsCursor.toArray()

	client.close()
	
	return res.json(logs)
})