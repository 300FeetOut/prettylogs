import getClient from '../../lib/getClient'

import {ManagementClient} from 'auth0'

import {decrypt, encrypt} from '../../lib/encryption.js'

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

export default async function handler(req, res) {
	const managementClient = await getManagementClient()
	const userId = decrypt(req.query.auth.trim())
	try {
		const user = await managementClient.getUser({id: userId})
	} catch (e) {
		return res.send('nope')
	}

	const projectName = req.query.project

	const client = await getClient()
	const db = client.db('Prettylogs')

	let project = await db.collection('projects').findOne({name: projectName})

	if (!project) {
		const insertedResponse = await db.collection('projects').insertOne({
			name: projectName,
			created: Date.now()
		})

		project = {_id: insertedResponse.insertedId}
	}

	const logs = req.body
	logs.map(log => {
		log.project = project._id
		log.stack_trace = JSON.parse(log.stack_trace)
		log.owner = userId
		return log
	})

	await db.collection('logs').insertMany(logs)

	client.close()

	res.send('ok')
}
