import getClient from '../../lib/getClient'

import {withApiAuthRequired, getSession} from '@auth0/nextjs-auth0'

export default withApiAuthRequired(async function handler(req, res) {
	const session = await getSession(req, res)
	const user = session.user

	const client = await getClient()
	const db = client.db('Prettylogs')

	const query = {owner: user.sub}

	const projectsCursor = await db.collection('projects').find(query)
	const projects = await projectsCursor.toArray()

	client.close()

	return res.json(projects)
	// return res.json([
	// 	{
	// 	  name: 'Dev',
	// 	  created: 1659730482094,
	// 	  owner: 'google-oauth2|111822682839916165003'
	// 	},
	// 	{
	// 	  name: 'ECS',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1660174567980
	// 	},
	// 	{
	// 	  name: 'Threefo',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1660176431240
	// 	},
	// 	{
	// 	  name: 'CaptionTools',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1661808090721
	// 	},
	// 	{
	// 	  name: 'TDC',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1663887780333
	// 	},
	// 	{
	// 	  name: '3foBase',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1664490736414
	// 	},
	// 	{
	// 	  name: 'Alohilani',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1669078573327
	// 	},
	// 	{
	// 	  name: 'Personalis',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1671056107491
	// 	},
	// 	{
	// 	  name: 'BPP',
	// 	  owner: 'google-oauth2|111822682839916165003',
	// 	  created: 1694627249099
	// 	}
	// ])
})
