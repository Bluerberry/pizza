
import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';

import { 
	decodeAccessToken,
	useRefreshToken,
	login
} from '$lib/server/auth';

import type { Handle } from '@sveltejs/kit';

export const auth: Handle = async ({ event, resolve }) => {
	try {

		// Check if the user is has an access_token
		const accessToken = event.cookies.get('access_token');

		if (accessToken) {
			const { userID } = decodeAccessToken(accessToken);

			if (userID) {
				const user = await prisma.user.findUnique({
					where: { id: userID },
				});

				if (!user) {
					log.error({ userID }, 'Valid access token provided, but user does not exist in database');
					throw new Error('User not found');
				}

				log.debug({ userID }, 'User found in database');
				await login(event, user, false);
				return resolve(event);
			}

			// If the access_token is invalid, delete it
			log.info('Invalid/expired access token provided, attempting to refresh...');
			event.cookies.delete('access_token', { path: '/' });
		}


		// Check if the user has a refresh_token
		const refreshToken = event.cookies.get('refresh_token');
		if (!refreshToken) {
			log.warn('No refresh token provided, user not authenticated');
			throw new Error('No refresh token provided');
		}

		// Use the refresh token to get a new access token
		const refreshData = await useRefreshToken(refreshToken)
		await login(event, refreshData.user);
		return resolve(event);

	} catch (error) {

		event.cookies.delete('access_token', { path: '/' });
		event.cookies.delete('refresh_token', { path: '/' });
		event.locals.user = null;
		return resolve(event);

	}
};
