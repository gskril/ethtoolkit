export default function Card({ isLoading, label, type, number, children }) {
	return (
		<>
			<div className="card">
				{label && <div className="label">{label}</div>}
				<div className="content">
					{isLoading ? (
						<div className="loading"></div>
					) : type === 'number' ? (
						<span className="number">{number}</span>
					) : (
						children
					)}
				</div>
			</div>

			<style jsx>{`
				.card {
					padding: 1rem;
					color: var(--gray-50);
					background-color: var(--gray-700);
					text-align: center;
					box-shadow: 2px 4px 24px -4px rgba(0, 0, 0, 0.25);
					border-radius: 0.5rem;
				}

				.card a {
					color: var(--blue-300);
				}

				.label {
					color: var(--gray-400);
					display: block;
					margin-bottom: 0.5rem;
				}

				.number {
					font-size: 2rem;
					font-weight: 600;
					line-height: 1;
				}

				.loading {
					width: 60%;
					height: 2.1rem;
					border-radius: 0.25rem;
					background-color: var(--gray-600);
					margin: 0 auto;
				}
			`}</style>
		</>
	)
}
