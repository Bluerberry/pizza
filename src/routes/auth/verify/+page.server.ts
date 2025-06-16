
import log from '$lib/server/logging';
import { sendVerificationEmail, useVerificationToken } from '$lib/server/auth';
import { hasPermission, Permission } from '$lib/server/permissions';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';
import type { User } from '@prisma/client';

export const load: PageServerLoad = async ({ locals, url }) => {

	// Check if user has permission to request verification
	if (!hasPermission(locals.user, Permission.UNVERIFIED, Permission.UNVERIFIED)) {
		log.warn({ userId: locals.user?.id }, 'User does not have permission to request verification email');
		return fail(403, { message: 'You do not have permission to request a verification email' });
	}

	// Get token from search params
	const verificationToken = url.searchParams.get('token');
	if (!verificationToken) {
		log.warn('No verification token provided in verification URL');
		return fail(400, { message: 'No verification token provided' });
	}

	try {

		// Use the verification token, throws if invalid or expired
		const verificationData = await useVerificationToken(verificationToken);

		// Verify the user
		await prisma.user.update({
			where: { id: verificationData.userID },
			data: { verified: true }
		});

	} catch (error) {
		
	}
}

export const actions: Actions = {
	'request-verification': async ({ locals }) => {

		// Check if user has permission to request verification
		if (!hasPermission(locals.user, Permission.UNVERIFIED, Permission.UNVERIFIED)) {
			log.warn({ userId: locals.user?.id }, 'User does not have permission to request verification email');
			return fail(403, { message: 'You do not have permission to request a verification email' });
		}

		try {
			await sendVerificationEmail(locals.user as User);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			log.error({ error: errorMessage }, 'Error during verification request');
			return fail(500, { message: errorMessage });
		}
	}
};