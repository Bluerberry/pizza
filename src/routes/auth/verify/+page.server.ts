
import argon2 from 'argon2';
import { fail, redirect } from '@sveltejs/kit';

import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';
import { AuthError, verify } from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async event => {
	const { url, locals } = event;

	// If search params contain verification token, use token, then redirect to home
	const verificationToken = url.searchParams.get('token')
	if (verificationToken) { 
		try {

			await verify(event)

		} catch (error) {

			// Handle specific AuthError

			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during verification request');
			return fail(500, { message: errorMessage });

		}

		throw redirect(303, '/')
	}

	// If not logged in, redirect to login
	if (event.locals.user == null) {
		throw redirect(303, 'auth/login');
	}

	// If already verified, redirect to home
	if (event.locals.user.verified) {
		throw redirect(303, '/');
	}

	// If no unexpired verification token exists, send verification email.
	const data = prisma.verificationToken.findFirst({
		where: {
			userID: event.locals.user.id,
			expiresAt: {
				gte: new Date()
			}
		}
	})

	if (data == null) {
		await sendVerificationEmail(event.locals.user);
	}
}

export const actions: Actions = {
	'request-verification': async ({ locals }) => {
		if (!locals.user || locals.user.verified) {
			return fail(403, { message: 'You do not have permission to request verification' });
		}
	}
};