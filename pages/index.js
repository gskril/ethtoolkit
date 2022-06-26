import Head from 'next/head'
import Image from 'next/image'
import Tool from '../components/list-item'

const tools = [
	{
		name: 'Ethereum',
		slug: 'eth',
		color: 'linear-gradient(92.29deg, #89AAF3 0%, #C7B1F6 100%)',
	},
	{
		name: 'Ethereum Name Service',
		slug: 'ens',
		color: 'linear-gradient(92.29deg, #879AF4 0%, #66B9EB 100%)',
	},
	{
		name: 'Optimism',
		slug: './optimism',
		color: '#EA3431',
	},
	{
		name: 'Degen Lottery',
		slug: 'lottery',
		color: '#19191A',
	},
]

export default function Home() {
	return (
		<div className="container">
			<Head>
				<title>Simplify Your Ethereum Toolkit</title>
			</Head>

			<header className="header">
				<h1 className="title">Simplify Your Ethereum Toolkit</h1>
				<p className="subtitle">
					Replace dozens of bookmarked websites with one that does it
					all.
				</p>
			</header>

			<main>
				<div className="tools">
					{tools.map((tool, i) => (
						<Tool
							key={i}
							name={tool.name}
							slug={tool.slug}
							color={tool.color}
						/>
					))}
				</div>
			</main>
		</div>
	)
}
