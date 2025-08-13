
import { 
	tryAccessToken,
	AuthError,
	AuthErrorCode,
	tryRefreshToken
} from '$lib/server/auth';

import type { Handle } from '@sveltejs/kit';

export const auth: Handle = async ({ event, resolve }) => {
	try {

		// Try access token
		await tryAccessToken(event)
		return resolve(event);

	} catch (error) {
		if (
			!(error instanceof AuthError) || 
			error.code === AuthErrorCode.MissingUser
		) {

			// Fail authentication if regular error is raised, or if user is missing
			event.cookies.delete('access_token', { path: '/' });
			event.cookies.delete('refresh_token', { path: '/' });
			event.locals.user = null;
			return resolve(event);
		}
	}

	try {

		// Try to refresh the access token
		await tryRefreshToken(event);

	} catch (error) {

		// Fail authentication
		event.cookies.delete('access_token', { path: '/' });
		event.cookies.delete('refresh_token', { path: '/' });
		event.locals.user = null;
	}

	return resolve(event);
};
