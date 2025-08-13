
import log from '$lib/server/log';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from '$lib/schemas/authSchemas';
import { superValidate, message } from 'sveltekit-superforms';
import { AuthError, login, register } from '$lib/server/auth';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/');
	}

	return {
		registerForm: await superValidate(zod(registerSchema))
	}
};

export const actions: Actions = {
	default: async event => {
		const { request, locals } = event;

		// Validate form using Zod
		const form = await superValidate(request, zod(registerSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Registration form validation failed');
			return message(form, 'Invalid form data', { status: 400 });
		}

		// Cannot register while logged in
		if (locals.user) {
			log.warn({ userID: locals.user?.id }, 'User is already logged in, cannot register');
			return message(form, 'You cannot register while logged in', { status: 403 });
		}

		try {

			// Check if email already exists
			const emailExists = await prisma.user.findUnique({ where: { email: form.data.email } });
			if (emailExists) {
				log.warn({ email: form.data.email }, 'Registration attempt with existing email');
				return message(form, 'Email already exists', { status: 400 });
			}

			// Register & login
			const user = await register(form.data.username, form.data.email, form.data.password);
			await login(event, user);

		} catch (error) {
			if (error instanceof AuthError) {
				return message(form, error.message, { status: error.status });
			} else {
				const errorMessage = error instanceof Error ? error.message : error;
				log.error({ error: errorMessage }, 'Error during login');
				return message(form, errorMessage, { status: 500 });
			}
		}

		// Send user to verification
		redirect(303, '/auth/verify');
	}
};