
import log from '$lib/server/log';
import { error } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { Permission } from '$lib/scripts/permissions';

import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	try {

		// Check if user is known
		if (locals.user === null) {
			log.warn('Stranger denied access', { imageID: params.imageID, url: url.toString() });
			error(401, 'Unauthorized');
		}
		
		// Get image
		const image = await prisma.image.findUnique({
			where: {
				id: params.imageID
			},
			include: {
				session: true
			}
		});

		if (!image) {
			log.error('Image not found', { imageID: params.imageID })
			error(404, 'Not Found');
		}

		// Check permissions
		if (
			locals.user.id !== image.session.userID ||
			locals.permissions < Permission.VerifiedAdmin || // Technically redundant, but who's keeping track anyway
			image.session.locked && image.session.maxReleaseAt.getTime() >= Date.now()
		) {
			log.warn('User lacks permissions', { imageID: params.imageID, url: url.toString() });
			error(403, 'Forbidden');
		}

		// Serve image
		return new Response(image.data, {
			headers: {
				'Content-Type': image.type,
				'Content-Length': image.data.length.toString()
			}
		})

	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : err;
		log.error('Error during GET request', { url: url.toString(), error: errorMessage });
		error(500, 'Internal Error');
	}
}