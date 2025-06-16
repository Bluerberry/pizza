
import argon2 from 'argon2';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms';

import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';
import { registerSchema } from '$lib/schemas/authSchemas';
import { createAccessToken, createRefreshToken } from '$lib/server/auth';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {
		registerForm: await superValidate(zod(registerSchema))
	}
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, getClientAddress }) => {

		// Validate form using Zod
		const form = await superValidate(request, zod(registerSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Registration form validation failed');
			return message(form, 'Invalid form data', { status: 400 });
		}

		// Cannot register while logged in
		if (locals.user) {
			log.warn({ userId: locals.user?.id }, 'User is already logged in, cannot register');
			return message(form, 'You cannot register while logged in', { status: 403 });
		}

		try {

			// Check if email already exists
			const emailExists = await prisma.user.findUnique({ where: { email: form.data.email } });
			if (emailExists) {
				log.warn({ email: form.data.email }, 'Registration attempt with existing email');
				return message(form, 'Email already exists', { status: 400 });
			}

			// Register user
			const user = await prisma.user.create({
				data: {
					username: form.data.username,
					email: form.data.email,
					password: await argon2.hash(form.data.password)
				}
			});

			// Create new tokens
			const userAgent = request.headers.get('user-agent');
			const ipAdress = getClientAddress()
			const accessToken = createAccessToken(user);
			const refreshToken = await createRefreshToken(user, userAgent, ipAdress);
		
			// Set cookies
			cookies.set('access_token', accessToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: true,
				maxAge: 60 * 15 // 15 minutes
			});
		
			cookies.set('refresh_token', refreshToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: true,
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
		
			// Set locals
			locals.user = user;

			// Send user to verification
			throw redirect(303, 'auth/verify');

		} catch (error) {

			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during registration');
			return message(form, errorMessage, { status: 500 });

		}
	}
};