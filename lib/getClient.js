import { MongoClient, ServerApiVersion } from 'mongodb'

export default async function getClient() {
	const uri = "mongodb+srv://prettylogs_admin:cvSJlFVWkoECCD6i@prettylogs.qbzcplh.mongodb.net/?retryWrites=true&w=majority";
	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1
	});
	
	return await client.connect()
}