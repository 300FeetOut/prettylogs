import getClient from '../../lib/getClient'

export const runtime = 'edge'

export default async function handler(req, res) {

	if (req.query.auth != 'plsclearoldlogs') {
		return res.status(404).send('Not found')
	}

	try {
		const client = await getClient()
		const db = client.db('Prettylogs')

		const expiryTime = Date.now() - 1000 * 60 * 60 * 24 * 7
		const result = await db.collection('logs').deleteMany({created: {$lt: expiryTime}})
		console.log('delete result', result)

		client.close()
		
		return res.send('ok')
	} catch (e) {
		console.log(e)
		return res.status(500).send('An error occurred')
	}
}