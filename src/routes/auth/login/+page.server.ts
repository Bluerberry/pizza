
import argon2 from 'argon2';
import log from '$lib/server/log';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { AuthError, login } from '$lib/server/auth';
import { loginSchema } from '$lib/schemas/authSchemas';
import { superValidate, message } from 'sveltekit-superforms';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/')
	}

	return {
		loginForm: await superValidate(zod(loginSchema))
	}
};

export const actions: Actions = {
	default: async event => {
		const { request, locals } = event;

		// Validate form using Zod
		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Login form validation failed');
			return message(form, 'Invalid form data', { status: 400 })
		}

		// Check if user can log in
		if (locals.user) {
			log.warn({ userID: locals.user.id }, 'User is already logged in, cannot log in again');
			return message(form, 'You are already logged in', { status: 403 });
		}

		try {

			// Validate email
			const user = await prisma.user.findUnique({
				where: {
					email: form.data.email
				}
			});

			if (!user) {
				log.warn({ email: form.data.email }, 'Login attempt with unknown email');
				return message(form, 'Invalid credentials', { status: 401 });
			}

			// Validate password
			const validPassword = await argon2.verify(user.password, form.data.password);
			if (!validPassword) {
				log.warn({ email: form.data.email }, 'Login attempt with invalid password');
				return message(form, 'Invalid credentials', { status: 401 });
			}

			// Login
			await login(event, user)

		} catch (error) {
			if (error instanceof AuthError) {
				return message(form, error.message, { status: error.status });
			} else {
				const errorMessage = error instanceof Error ? error.message : error;
				log.error({ error: errorMessage }, 'Error during login');
				return message(form, errorMessage, { status: 500 });
			}
		}

		// Redirect appropriately
		if (locals.user!.verified) {
			redirect(303, '/');
		} else {
			redirect(303, '/auth/verify');
		}
	}
};
