import getClient from '../../lib/getClient'

export default async function handler(req, res) {
	if (req.query.auth !== 'e1f4850aab649b48a66aed38074bbe4b84a85fd6') {
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
		return log
	})

	await db.collection('logs').insertMany(logs)

	client.close()

	res.send('ok')
}
