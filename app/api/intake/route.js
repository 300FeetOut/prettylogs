import getClient from '@/lib/getClient'

import {ManagementClient} from 'auth0'

import {decrypt, encrypt} from '@/lib/encryption'

export const runtime = 'nodejs'

async function getManagementClient() {
	const options = {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			client_id: process.env.AUTH0_SERVER_CLIENT_ID,
			client_secret: process.env.AUTH0_SERVER_CLIENT_SECRET,
			audience: "https://prettylogs.us.auth0.com/api/v2/",
			grant_type: "client_credentials",
		})
	}

	const credentialsResponse = await fetch('https://prettylogs.us.auth0.com/oauth/token', options)
	const credentials = await credentialsResponse.json()

	return new ManagementClient({
		token: credentials.access_token,
		domain: 'prettylogs.us.auth0.com'
	})
}

export async function POST(request) {
	const managementClient = await getManagementClient()
	const searchParams = request.nextUrl.searchParams
	const auth = searchParams.get('auth')
	const userId = decrypt(auth.trim())
	try {
		// Make sure user exists, else fail
		await managementClient.getUser({id: userId})
	} catch (e) {
		return new Response('nope', { status: 400 })
	}

	const projectName = searchParams.get('project')

	const client = await getClient()
	const db = client.db('Prettylogs')

	let project = await db.collection('projects').findOne({name: projectName, owner: userId})

	if (!project) {
		const insertedResponse = await db.collection('projects').insertOne({
			name: projectName,
			owner: userId,
			created: Date.now()
		})

		project = {_id: insertedResponse.insertedId}
	}

	const logs = await request.json()
	logs.map(log => {
		log.project = project._id
		log.stack_trace = JSON.parse(log.stack_trace)
		log.owner = userId
		log.pinned = 0
		return log
	})

	await db.collection('logs').insertMany(logs)

	client.close()

	return new Response('ok', { status: 200 })
}
