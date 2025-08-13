
import log from '$lib/server/log';
import { AuthError, logout } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	redirect(301, '/');
}

export const actions: Actions = {
	default: async event => {
		const { locals } = event;

		// Check if user can log out
		if (locals.user == null) {
			log.warn('User is not logged in, cannot log out');
			return fail(403, { message: 'You are not logged in' });
		}

		try {

			// Logout
			await logout(event);
			
		} catch (error) {
			if (error instanceof AuthError) {
				return fail(error.status, { message: error.message, code: error.code });
			} else {
				const errorMessage = error instanceof Error ? error.message : error;
				log.error({ error: errorMessage }, 'Error during login');
				return fail(500, { message: errorMessage });
			}
		}
	}
};
