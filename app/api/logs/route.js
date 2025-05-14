import {ObjectId} from 'mongodb'

import getClient from '@/lib/getClient'
import { auth0 } from '@/lib/auth0'

export const runtime = 'nodejs'

export async function GET(request) {
	const session = await auth0.getSession()
	const user = session.user

	if (!user) {
		return new Response('Unauthorized', { status: 401 })
	}

	const searchParams = request.nextUrl.searchParams

	const projectId = searchParams.get('project')
	const pinned = searchParams.get('pinned')
	const lastRefresh = searchParams.get('lastRefresh')

	try {
		const client = await getClient()
		const db = client.db('Prettylogs')

		const query = {project: ObjectId(projectId), owner: user.sub}

		const cutoffSeconds = 1
		const cutoff = lastRefresh ? lastRefresh - (cutoffSeconds * 1000) : (Date.now() - (1000*60*cutoffSeconds))

		query.pinned = parseInt(pinned)
		if (query.pinned == 0) {
			query.created = {$gt: cutoff}
		}

		const logsCursor = await db.collection('logs').find(query)
		const logs = await logsCursor.toArray()

		client.close()
		
		return Response.json(logs.reverse())
	} catch (e) {
		console.log(e)
		return new Response('An error occurred', { status: 500 })
	}		
}