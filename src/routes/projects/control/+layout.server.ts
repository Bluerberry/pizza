
import log from '$lib/server/log';
import prisma from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { Permission } from '$lib/scripts/permissions';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {

	// Check permissions
	if (locals.user === null) {
		log.warn('Stranger denied access', { url: url.toString() });
		error(401, 'Unauthorized');
	}

	if (locals.permissions < Permission.VerifiedAdmin) {
		log.warn('User lacks permissions', { url: url.toString() });
		error(403, 'Forbidden');
	}

	try {

		// Get session
		return {
			session: await prisma.controlSession.findUnique({
				where: {
					userID: locals.user.id
				},
				include: {
					images: {
						select: {
							id: true
						}
					}
				}
			})
		}

	} catch {
		const errorMessage = error instanceof Error ? error.message : error;
		log.error('Error loading page', { url: url.toString(), error: errorMessage });
		error(500, 'Internal Error');
	}
};