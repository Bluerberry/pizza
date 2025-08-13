
import argon2 from 'argon2';
import log from '$lib/server/log';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { Permission } from '$lib/scripts/permissions';
import { superValidate, message } from 'sveltekit-superforms';

import {
	changeUsernameSchema,
	changeEmailSchema,
	changePasswordSchema
} from '$lib/schemas/authSchemas';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user === null) {
		redirect(303, '/')
	}

	return {
		changeUsernameForm: await superValidate(zod(changeUsernameSchema)),
		changeEmailForm: await superValidate(zod(changeEmailSchema)),
		changePasswordForm: await superValidate(zod(changePasswordSchema))
	}
};

export const actions: Actions = {
	'change-username': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod(changeUsernameSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Change username form validation failed');
			return message(form, 'Invalid form data', { status: 400 })
		}

		// Check permissions
		if (locals.user === null) {
			log.warn('User not logged in, tried to change username')
			return message(form, 'You are not logged in', { status: 401 });
		}

		if (locals.permissions < Permission.Verified) {
			log.warn('User lacks permissions to change username')
			return message(form, 'You need to be verified', { status: 403 })
		}

		// Check if new username is the same as before
		if (locals.user.username === form.data.username) {
			log.warn('New username same as old username')
			return message(form, 'New username needs to be different', { status: 400 })
		}

		try {

			// Update username
			await prisma.user.update({
				where: { id: locals.user.id },
				data: { username: form.data.username }
			})

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : error;
			log.error({ error: errorMessage }, 'Error during changing username');
			return message(form, errorMessage, { status: 500 });
		}
	},

	'change-email': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod(changeEmailSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Change email form validation failed');
			return message(form, 'Invalid form data', { status: 400 })
		}

		// Check permissions
		if (locals.user === null) {
			log.warn('User not logged in, tried to change email')
			return message(form, 'You are not logged in', { status: 401 });
		}

		// Check if new email is the same as before
		if (locals.user.email === form.data.email) {
			log.warn('New email same as old email')
			return message(form, 'New email needs to be different', { status: 400 })
		}

		try {

			// Validate password
			const validPassword = await argon2.verify(locals.user.password, form.data.password);
			if (!validPassword) {
				log.warn('Invalid password, tried to change email');
				return message(form, 'Invalid credentials', { status: 401 });
			}

			// Update email and verification status
			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					email: form.data.email,
					verified: false
				}
			})

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : error;
			log.error({ error: errorMessage }, 'Error during changing email');
			return message(form, errorMessage, { status: 500 });
		}

		// Redirect appropriately
		log.info({ userID: locals.user!.id }, 'Successfuly changed user email, awaiting verification')
		redirect(303, '/auth/verify');
	},

	'change-password': async ({ request, locals }) => {

		// Validate form using Zod
		const form = await superValidate(request, zod(changePasswordSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Change password form validation failed');
			return message(form, 'Invalid form data', { status: 400 })
		}

		// Check permissions
		if (locals.user === null) {
			log.warn('User not logged in, tried to change password')
			return message(form, 'You are not logged in', { status: 401 });
		}

		if (locals.permissions < Permission.Verified) {
			log.warn('User lacks permissions to change password')
			return message(form, 'You need to be verified', { status: 403 })
		}

		try {

			// Validate password
			const validPassword = await argon2.verify(locals.user.password, form.data.oldPassword);
			if (!validPassword) {
				log.warn('Invalid password, tried to change password');
				return message(form, 'Invalid credentials', { status: 401 });
			}

			// Check if new password is the same as before
			if (form.data.newPassword === form.data.oldPassword) {
				log.warn('New password same as old password')
				return message(form, 'New password needs to be different', { status: 400 })
			}

			// Update email and verification status
			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					password: await argon2.hash(form.data.newPassword)
				}
			})

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : error;
			log.error({ error: errorMessage }, 'Error during changing password');
			return message(form, errorMessage, { status: 500 });
		}
	}
}