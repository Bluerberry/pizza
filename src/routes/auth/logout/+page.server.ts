
import argon2 from 'argon2';
import { fail, redirect } from '@sveltejs/kit';

import log from '$lib/server/logging';
import prisma from '$lib/server/prisma'
import { deriveTokenID } from '$lib/server/auth';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	throw redirect(301, '/');
}

export const actions: Actions = {
	default: async ({locals, cookies}) => {

		// Check if user has permission to logout
		if (locals.user == null) {
			log.warn('User is not logged in, cannot log out');
			return fail(403, { message: 'You are not logged in' });
		}

		try {

			// Get tokens
			const refreshToken = cookies.get('refresh_token');

			// Delete cookies
			cookies.delete('access_token', { path: '/' });
			cookies.delete('refresh_token', { path: '/' });

			// Delete the refresh token from the database
			if (refreshToken) {
			
				// Find the matching token in the database
				const refreshTokenID = deriveTokenID(refreshToken);
				const refreshTokenData = await prisma.refreshToken.findUnique({
					where: { id: refreshTokenID },
					include: { user: true }
				});
			
				if (!refreshTokenData) {
					log.warn({ refreshTokenID }, 'Logout attempt with non-existent refresh token');
					return;
				}
			
				// Validate the refresh token
				const isValid = await argon2.verify(refreshTokenData.hash, refreshToken);
				if (!isValid) {
					log.warn({ refreshTokenID }, 'Logout attempt with invalid refresh token');
					return;
				}
			
				// Delete the refresh token from the database
				await prisma.refreshToken.delete({ where: { id: refreshTokenID } });
				log.info({ userId: refreshTokenData.user.id }, 'User logged out successfully');
			}

		} catch (error) {

			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during login');
			return fail(500, { message: errorMessage });

		}
	}
};
