
import argon2 from 'argon2';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms';

import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';
import { loginSchema } from '$lib/schemas/authSchemas';
import { createAccessToken, createRefreshToken } from '$lib/server/auth';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/')
	}

	return {
		loginForm: await superValidate(zod(loginSchema))
	}
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, getClientAddress }) => {

		// Validate form using Zod
		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) {
			log.warn({ errors: form.errors }, 'Login form validation failed');
			return message(form, 'Invalid form data', { status: 400 })
		}

		// Check if user has permission to log in
		if (locals.user) {
			log.warn({ userId: locals.user.id }, 'User is already logged in, cannot log in again');
			return message(form, 'You are already logged in', { status: 403 });
		}

		try {

			// Validate credentials
			const user = await prisma.user.findUnique({
				where: { 
					email: form.data.email 
				}
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

			// Redirect appropriately
			if (user.verified) {
				log.info({ userID: user.id }, 'Successfuly logged user in')
				throw redirect(303, '/');
			} else {
				log.info({ userID: user.id }, 'Successfuly logged user in, awaiting verification')
				throw redirect(303, '/auth/verify');
			}

		} catch (error) {

			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during login');
			return message(form, errorMessage, { status: 500 });

		}
	}
};
