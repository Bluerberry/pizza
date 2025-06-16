
import argon2 from 'argon2';
import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';
import { loginSchema } from '$lib/schemas/authSchemas';
import { login } from '$lib/server/auth';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { hasPermission, Permission } from '$lib/server/permissions';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/');
	}

    return {
        loginForm: await superValidate(zod(loginSchema))
    }
};

export const actions: Actions = {
	default: async event => {
		const { locals, request } = event;

		// Validate form using Zod
		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Login form validation failed');
			return fail(400, { form });
		}

		// Check if user has permission to register
		if (!hasPermission(locals.user, Permission.STRANGER, Permission.STRANGER)) {
			log.warn({ userId: locals.user?.id }, 'User does not have permission to register');
			return message(form, 'You do not have permission to register', { status: 403 });
		}

		try {

			// Validate credentials
			const user = await prisma.user.findUnique({
				where: { email: form.data.email }
			});

			if (!user) {
				log.warn({ email: form.data.email }, 'Login attempt with non-existent user');
				return message(form, 'Invalid credentials', { status: 401 });
			}

			const validPassword = await argon2.verify(user.password, form.data.password);
			if (!validPassword) {
				log.warn({ email: form.data.email }, 'Login attempt with invalid password');
				return message(form, 'Invalid credentials', { status: 401 });
			}

			// Login user
			await login(event, user);
			return message(form, 'Login successful');

		} catch (error) {

			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during login');
			return message(form, errorMessage, { status: 500 });

		}
	}
};
