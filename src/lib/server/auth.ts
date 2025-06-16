
import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import log from '$lib/server/logging';
import prisma from '$lib/server/prisma';

import { APP_URL, HMAC_SECRET, JWT_SECRET } from '$env/static/private';

import type { User, RefreshToken, VerificationToken } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import { sendEmail, verificationTemplate } from './email';

// --------------------> Types

export type AccessTokenPayload = {
	userID: string | null;
};

// --------------------> Errors

export class AuthError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

// Utility
export function generateToken() {
	return crypto.randomBytes(32).toString('base64url');
}

export function deriveTokenID(token: string) {
	return crypto
		.createHmac('sha256', HMAC_SECRET)
		.update(token)
		.digest('base64url');
}

// Verification Tokens
export async function createVerificationToken(user: User) {
	const newVerificationToken = generateToken();
	const newVerificationTokenID = deriveTokenID(newVerificationToken);
	const newVerificationTokenHash = await argon2.hash(newVerificationToken);

	await prisma.verificationToken.create({
		data: {
			id: newVerificationTokenID,
			hash: newVerificationTokenHash,
			expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
			userID: user.id,
		}
	});

	return newVerificationToken;
}

// Refresh Tokens
export async function createRefreshToken(user: User, userAgent: string | null, ipAddress: string | null) {
	const newRefreshToken = generateToken();
	const newRefreshTokenID = deriveTokenID(newRefreshToken);
	const newRefreshTokenHash = await argon2.hash(newRefreshToken);

	await prisma.refreshToken.create({
		data: {
			id: newRefreshTokenID,
			hash: newRefreshTokenHash,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			userID: user.id,
			userAgent,
			ipAddress
		}
	});

	return newRefreshToken;
}

export async function useRefreshToken(token: string, deleteAfterUse: boolean = true): Promise<RefreshToken & { user: User }> {
	const tokenID = deriveTokenID(token);
	const data = await prisma.refreshToken.findUnique({
		where: { id: tokenID },
		include: { user: true }
	});

	// Check if the refresh token exists in the database
	if (!data) {
		log.warn({ token }, 'Refresh token not found in database');
		throw new ValidationError('Refresh token not found');
	}

	// Verify the token hash
	const isValid = await argon2.verify(data.hash, token);
	if (!isValid) {
		log.warn('Invalid refresh token provided');
		throw new ValidationError('Invalid refresh token provided');
	}

	// Check if the refresh token is expired
	const isExpired = data.expiresAt < new Date();
	if (isExpired) {
		log.warn('Expired refresh token provided');
		await prisma.refreshToken.delete({ where: { id: tokenID } });
		throw new ValidationError('Expired refresh token provided');
	}

	// Delete the refresh token after use
	if (deleteAfterUse) {
		await prisma.refreshToken.delete({ where: { id: tokenID } });
	}

	return data;
}

// Access Tokens
export function createAccessToken(user: User) {
	const token = jwt.sign(
		{ userID: user.id }, 
		JWT_SECRET, 
		{ expiresIn: 60 * 15 } // 15 minutes
	);

	return token;
}

export function decodeAccessToken(token: string): AccessTokenPayload {
	try {
		return jwt.verify(
			token, 
			JWT_SECRET, 
			{ clockTolerance: 5 }
		) as AccessTokenPayload;
	} catch {
		return { userID: null };
	}
}

// Actions
export async function login(event: RequestEvent, user: User) {

	// Create new tokens
	const userAgent = event.request.headers.get('user-agent');
	const ipAdress = event.getClientAddress()
	const accessToken = createAccessToken(user);
	const refreshToken = await createRefreshToken(user, userAgent, ipAdress);

	// Set cookies
	event.cookies.set('access_token', accessToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 60 * 15 // 15 minutes
	});

	event.cookies.set('refresh_token', refreshToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});

	// Set locals
	event.locals.user = user;
}

export async function logout(event: RequestEvent) {

	// Get tokens
	const refreshToken = event.cookies.get('refresh_token');

	// Delete cookies
	event.cookies.delete('access_token', { path: '/' });
	event.cookies.delete('refresh_token', { path: '/' });

	// Delete the refresh token from the database
	if (refreshToken) {
	
		// Find the matching token in the database
		const refreshTokenID = deriveTokenID(refreshToken);
		const refreshTokenData = await prisma.refreshToken.findUnique({
			where: { id: refreshTokenID },
			include: { user: true }
		});
	
		if (!refreshTokenData) {
			log.warn({ refreshTokenID }, 'Logout attempt with non-existent refresh token');
			return;
		}
	
		// Validate the refresh token
		const isValid = await argon2.verify(refreshTokenData.hash, refreshToken);
		if (!isValid) {
			log.warn({ refreshTokenID }, 'Logout attempt with invalid refresh token');
			return;
		}

		// Check if user and token match
		if (event.locals.user && event.locals.user.id !== refreshTokenData.user.id) {
			log.warn({ userId: event.locals.user.id, refreshTokenID }, 'Logout attempt with mismatched refresh token');
			return;
		}
	
		// Delete the refresh token from the database
		await prisma.refreshToken.delete({ where: { id: refreshTokenID } });
		log.info({ userId: refreshTokenData.user.id }, 'User logged out successfully');
	}
}

export async function verify(event: RequestEvent) {

	const verificationToken = event.url.searchParams.get('token')
	if (!verificationToken) {
		log.warn('No verification token provided');
		throw new AuthError('No verification token provided');
	}

	// Derive the database ID for the verification token
	const verificationTokenID = deriveTokenID(verificationToken);
	const verificationTokenData = await prisma.verificationToken.findUnique({
		where: { id: verificationTokenID },
		include: { user: true }
	});
	
	// Check if the verification token exists in the database
	if (!verificationTokenData) {
		log.warn({ tokenID: verificationTokenID }, 'Verification token not found in database');
		throw new AuthError('Invalid verification token provided');
	}

	// Verify the token hash
	const isValid = await argon2.verify(verificationTokenData.hash, verificationToken);
	if (!isValid) {
		log.warn({ tokenID: verificationTokenID }, 'Invalid verification token provided');
		throw new AuthError('Invalid verification token provided');
	}

	// Delete the verification token
	await prisma.verificationToken.delete({ where: { id: verificationTokenID } });
	
	// Check if the verification token is expired
	const isExpired = verificationTokenData.expiresAt < new Date();
	if (isExpired) {
		log.warn({ token: verificationToken }, 'Expired verification token provided');
		throw new AuthError('Expired verification token provided');
	}
	
	// Verify the user
	await prisma.user.update({
		where: { id: verificationTokenData.userID },
		data: { verified: true }
	});

	// Log in if not already
	if (event.locals.user != verificationTokenData.user) {
		if (event.locals.user)
			await logout(event);
		await login(event, verificationTokenData.user);
	}
}


/**
 * Sends a verification email to the user with a verification link.
 * **This function does NOT check credentials or permissions.**
 * @param user The user object to send the verification email to.
 */

export async function sendVerificationEmail(user: User) {
	const verificationToken = await createVerificationToken(user);
	const verificationUrl = `${APP_URL}/auth/verify?token=${verificationToken}`;
	await sendEmail(user.email, 'Verify your email', verificationTemplate(user.username, verificationUrl));
	log.info({ userId: user.id, email: user.email }, 'Verification email sent');
}
