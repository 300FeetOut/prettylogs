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

	const client = await getClient()
	const db = client.db('Prettylogs')

	const searchParams = request.nextUrl.searchParams
	const logId = searchParams.get('_id')
	const pinned = parseInt(searchParams.get('pin'))

	const updated = await db.collection('logs').findOneAndUpdate({_id: new ObjectId(logId)}, {$set: {pinned: pinned}}, {new: true})

	client.close()
	
	return Response.json({updated: updated.value})
}