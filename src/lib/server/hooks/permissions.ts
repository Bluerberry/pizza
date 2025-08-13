
import { getPermissions } from '$lib/scripts/permissions';
import type { Handle } from '@sveltejs/kit';

export const permissions: Handle = async ({ event, resolve }) => {
	event.locals.permissions = getPermissions(event.locals.user);
	return resolve(event);
};
