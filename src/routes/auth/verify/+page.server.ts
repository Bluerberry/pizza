
import log from '$lib/server/log';
import prisma from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { 
	AuthError, 
	AuthErrorCode, 
	requestVerification, 
	tryVerificationToken 
} from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async event => {
	const { locals } = event;
	let success = false;

	try {

		// Verify
		await tryVerificationToken(event)
		success = true;

	} catch (error) {
		if (error instanceof AuthError) {

			// If MissingToken, continue loading the page
			if (error.code !== AuthErrorCode.MissingToken) {
				return fail(error.status, { message: error.message, code: error.code });
			}

		} else {
			const errorMessage = error instanceof Error ? error.message : error;
			log.error({ error: errorMessage }, 'Error during verification request');
			return fail(500, { message: errorMessage });
		}
	}

	// Redirect if necessary
	if (success) {
		log.info({ userID: locals.user?.id }, 'User successfully verified');
		redirect(303, '/');
	} else if (locals.user == null) {
		log.warn('User is not logged in, cannot verify');
		redirect(303, '/auth/login');
	} else if (locals.user.verified) {
		log.warn({ userID: locals.user.id }, 'User is already verified');
		redirect(303, '/');
	}

	// Check if there already is a verification token for the user
	const youngestVerificationData = await prisma.verificationToken.findFirst({
		where: {
			userID: locals.user.id,
			expiresAt: {
				gte: new Date()
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	// Users can only request verification once every two minutes
	let nextAllowedRequest = 2 * 60 * 1000;

	// If there arent any verification tokens, send verification request
	if (!youngestVerificationData) {
		await requestVerification(locals.user);
		nextAllowedRequest += Date.now();
	} else {
		nextAllowedRequest += youngestVerificationData.createdAt.getTime();
	}

	return {
		nextAllowedRequest
	}
}

export const actions: Actions = {
	default: async event => {
		const { locals } = event;

		// Check permissions
		if (locals.user === null) {
			log.warn('User is not logged in, cannot verify');
			return fail(403, { message: 'You are not logged in' });
		}

		// Check if there already is a verification token for the user
		const youngestVerificationData = await prisma.verificationToken.findFirst({
			where: {
				userID: locals.user.id,
				expiresAt: {
					gte: new Date()
				}
				},
			orderBy: {
				createdAt: 'desc'
			}
		});

		// Check if youngest verification data is younger than 2 min ago
		if (
			youngestVerificationData && 
			youngestVerificationData.createdAt.getTime() > Date.now() - 2 * 60 * 1000
		) {
			log.warn('User requested verification too soon');
			return fail(429, { message: 'You can only request verification once every two minutes' });
		}

		// Send verification email
		await requestVerification(locals.user)
	}
}