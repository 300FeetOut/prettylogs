import {ObjectId} from 'mongodb'

import getClient from '../../lib/getClient'

import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export const runtime = 'edge'

export default withApiAuthRequired(async function handler(req, res) {
	const client = await getClient()
	const db = client.db('Prettylogs')

	const logId = req.query._id
	const pinned = parseInt(req.query.pin)

	const updated = await db.collection('logs').findOneAndUpdate({_id: new ObjectId(logId)}, {$set: {pinned: pinned}}, {new: true})

	client.close()
	
	res.json({updated: updated.value})
})