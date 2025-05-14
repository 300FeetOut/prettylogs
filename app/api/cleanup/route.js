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
	const auth = searchParams.get('auth')

	if (auth != 'plsclearoldlogs') {
		return new Response('Not found', { status: 404 })
	}

	try {
		const client = await getClient()
		const db = client.db('Prettylogs')

		const expiryTime = Date.now() - 1000 * 60 * 60 * 24 * 7
		const result = await db.collection('logs').deleteMany({created: {$lt: expiryTime}})
		console.log('delete result', result)

		client.close()
		
		return new Response('ok', { status: 200 })
	} catch (e) {
		console.log(e)
		return new Response('An error occurred', { status: 500 })
	}
}