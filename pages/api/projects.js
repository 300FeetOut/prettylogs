import getClient from '../../lib/getClient'

import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export default withApiAuthRequired(async function handler(req, res) {
	const session = getSession(req, res)
	const user = session.user


	const client = await getClient()
	const db = client.db('Prettylogs')

	const query = {owner: user.sub}

	const projectsCursor = await db.collection('projects').find(query)
	const projects = await projectsCursor.toArray()

	client.close()
	
	return res.json(projects)
})