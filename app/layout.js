import { Auth0Provider } from '@auth0/nextjs-auth0';
import '../styles/globals.sass';

export const metadata = {
	title: 'Pretty Logs',
	description: 'A beautiful logging application',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<Auth0Provider>{children}</Auth0Provider>
			</body>
		</html>
	);
}
