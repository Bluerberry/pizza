
import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';
import { registerSchema } from '$lib/schemas/authSchemas';
import { register, sendVerificationEmail } from '$lib/server/auth';
import { superValidate, message } from 'sveltekit-superforms';
import { hasPermission, Permission } from '$lib/server/permissions';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/');
	}

	return {
		registerForm: await superValidate(zod(registerSchema))
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {

		// Validate form using Zod
		const form = await superValidate(request, zod(registerSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Registration form validation failed');
			return message(form, 'Invalid form data', { status: 400 });
		}

		// Check if user has permission to register
		if (!hasPermission(locals.user, Permission.STRANGER, Permission.STRANGER)) {
			log.warn({ userId: locals.user?.id }, 'User does not have permission to register');
			return message(form, 'You do not have permission to register', { status: 403 });
		}

		try {

			// Check if email already exists
			const emailExists = await prisma.user.findUnique({ where: { email: form.data.email } });
			if (emailExists) {
				log.warn({ email: form.data.email }, 'Registration attempt with existing email');
				return message(form, 'Email already exists', { status: 400 });
			}

			// Register user
			const user = await register(form.data.username, form.data.email, form.data.password);
			await sendVerificationEmail(user);
			return message(form, 'Registration successful');

		} catch (error) {

			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during registration');
			return message(form, errorMessage, { status: 500 });

		}
	}
};