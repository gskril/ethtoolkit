const ethers = require('ethers')
import crypto from 'crypto'
import registrarAbi from '../../lib/ens-registry-abi.json'

export default async function commit(req, res) {
	const { chain, config, name, owner } = req.query
	const network = chain == 4 ? 'rinkeby' : 'mainnet'

	const provider = new ethers.providers.InfuraProvider(network, {
		projectId: process.env.INFURA_PROJECT_ID,
		projectSecret: process.env.INFURA_PROJECT_SECRET,
	})

	const contract = new ethers.Contract(
		'0x283af0b28c62c092c9727f1ee09c02ca627eb7f5',
		registrarAbi,
		provider
	)

	const isAvailable = await contract.available(name)
	if (!isAvailable) {
		res.status(200).json({ error: 'Name is not available' })
		return
	}

	const secret = '0x' + crypto.randomBytes(32).toString('hex')
	const commitment =
		config == undefined
			? await contract.makeCommitment(name, owner, secret)
			: await contract.makeCommitmentWithConfig(
					name,
					owner,
					secret,
					'0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
					owner
			  )
	res.status(200).json({
		commitment: commitment,
		secret: secret.toString('hex'),
		withConfig: config != undefined,
	})
}
