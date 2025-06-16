
import log from '$lib/server/logging';
import { logout } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { hasPermission, Permission } from '$lib/server/permissions';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	throw redirect(301, '/');
}

export const actions: Actions = {
	default: async (event) => {
		const { locals } = event;

		// Check if user has permission to register
		if (!hasPermission(locals.user, Permission.UNVERIFIED)) {
			log.warn({ userId: locals.user?.id }, 'User does not have permission to log out');
			return fail(403, { message: 'You do not have permission to log out' });
		}

		try {
			await logout(event)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during login');
			return fail(500, { message: errorMessage });
		}
	}
};
