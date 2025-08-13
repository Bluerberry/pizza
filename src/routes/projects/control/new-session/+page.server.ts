
import log from '$lib/server/log';
import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { zod } from 'sveltekit-superforms/adapters';
import { Permission } from '$lib/scripts/permissions';
import { superValidate, message } from 'sveltekit-superforms';
import { newControlSchema } from '$lib/schemas/controlSchemas';

export const load = async ({ parent }) => {

	// Route protected by layout

	const { session } = await parent();
	if (session) {
		redirect(303, './dashboard');
	}

	return { 
		newControlForm: await superValidate(zod(newControlSchema)) 
	};
};

export const actions = {
	default: async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod(newControlSchema));
		if (!form.valid) {
			log.error('New control session form validation failed', { errors: form.errors });
			return message(form, 'Invalid form data', { status: 400 })
		}

		// Check permissions
		if (locals.user === null) {
			log.warn('Denied new control session for stranger');
			error(401, 'Unauthorized');
		}

		if (locals.permissions < Permission.VerifiedAdmin) {
			log.warn('User lacks permissions for new control session');
			error(403, 'Forbidden');
		}

		try {

			// Create session
			const session = await prisma.controlSession.create({
				data: {
					userID: locals.user.id,
					releaseAt: form.data.releaseAt,
					maxReleaseAt: form.data.maxReleaseAt
				}
			})

			// Store images
			const imageData = await Promise.all(
				form.data.files.map(async image => ({
					name: image.name,
					type: image.type,
					data: Buffer.from(await image.arrayBuffer()),
					sessionID: session.id
				}))
			)

			await prisma.image.createMany({
				data: imageData
			})

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : error;
			log.error({ error: errorMessage }, 'Error during start control session');
			return message(form, errorMessage, { status: 500 });
		}
	}
};