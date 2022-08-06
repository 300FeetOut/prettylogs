import {ObjectId} from 'mongodb'

import getClient from '../../lib/getClient'


export default async function handler(req, res) {
	const projectId = req.query.project

	const client = await getClient()
	const db = client.db('Prettylogs')

	const logsCursor = await db.collection('logs').find({project: ObjectId(projectId)})
	const logs = await logsCursor.toArray()

	console.log(logs)

	client.close()
	
	return res.json(logs)
}
