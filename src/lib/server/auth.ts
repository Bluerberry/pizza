
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

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

// --------------------> Util Functions

function generateToken() {
	return crypto.randomBytes(32).toString('base64url');
}

function deriveTokenID(token: string) {
	return crypto
		.createHmac('sha256', HMAC_SECRET)
		.update(token)
		.digest('base64url');
}

// --------------------> Token Functions

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

	log.debug({ userID: user.id, newRefreshTokenID: newVerificationTokenID }, 'New verification token created');
	return newVerificationToken;
}

export async function useVerificationToken(token: string, deleteAfterUse: boolean = true): Promise<VerificationToken & { user: User }> {
	const tokenID = deriveTokenID(token);
	const data = await prisma.verificationToken.findUnique({
		where: { id: tokenID },
		include: { user: true }
	});

	// Check if the verification token exists in the database
	if (!data) {
		log.warn({ token }, 'Verification token not found in database');
		throw new ValidationError('Verification token not found');
	}
	
	log.debug({ id: data.id }, 'Verification token found in database');

	// Verify the token hash
	const isValid = await argon2.verify(data.hash, token);
	if (!isValid) {
		log.warn('Invalid verification token provided');
		throw new ValidationError('Invalid verification token provided');
	}

	// Check if the verification token is expired
	const isExpired = data.expiresAt < new Date();
	if (isExpired) {
		log.warn('Expired verification token provided');
		await prisma.verificationToken.delete({ where: { id: tokenID } });
		log.debug({ id: tokenID }, 'Verification token deleted from database');
		throw new ValidationError('Expired verification token provided');
	}

	// Delete the verification token after use
	if (deleteAfterUse) {
		await prisma.verificationToken.delete({ where: { id: tokenID } });
		log.debug({ id: tokenID }, 'Verification token deleted from database');
	}

	return data;
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

	log.debug({ userID: user.id, newRefreshTokenID }, 'New refresh token created');
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

	log.debug({ id: data.id }, 'Refresh token found in database');

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
		log.debug({ id: tokenID }, 'Refresh token deleted from database');
		throw new ValidationError('Expired refresh token provided');
	}

	// Delete the refresh token after use
	if (deleteAfterUse) {
		await prisma.refreshToken.delete({ where: { id: tokenID } });
		log.debug({ id: tokenID }, 'Refresh token deleted from database');
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

	log.debug({ userID: user.id }, 'New access token created');
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

// ---------------------> Actions

/**
 * Registers a new user in the database.
 * **This function does NOT check credentials or permissions.**
 * @param username The username of the new user.
 * @param email The email of the new user.
 * @param password The unhashed password of the new user.
 */

export async function register(username: string, email: string, password: string) {
	const user = await prisma.user.create({
		data: {
			username, email,
			password: await argon2.hash(password)
		}
	});

	log.debug({ userId: user.id }, 'New user created in database');
	log.info({ userId: user.id }, 'User registered successfully');
	return user;
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

/**
 * Logs a user in by setting new access and refresh tokens in their cookies.
 * **This function does NOT check credentials or permissions.**
 * @param event The request event containing the cookies and headers.
 * @param user The user object to log in.
 * @param rotateTokens Whether to create new tokens or use existing ones. Defaults to true.
 */

export async function login(event: RequestEvent, user: User, rotateTokens: boolean = true) {

	if (rotateTokens) {

		// Create new tokens
		const accessToken = createAccessToken(user);
		const newRefreshToken = await createRefreshToken(
			user, 
			event.request.headers.get('user-agent'),
			event.getClientAddress()
		);

		// Set cookies
		event.cookies.set('access_token', accessToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 60 * 15 // 15 minutes
		});

		event.cookies.set('refresh_token', newRefreshToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});
	}

	event.locals.user = user;
	log.info({ userId: user.id }, 'User logged in successfully');
}

/**
 * Logs a user out by deleting their access and refresh tokens from cookies.
 * **This function does NOT check credentials or permissions.**
 * @param event The request event containing the cookies.
 */

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
		const refreshTokenRecord = await prisma.refreshToken.findUnique({
			where: { id: refreshTokenID },
			include: { user: true }
		});

		if (!refreshTokenRecord) {
			log.warn({ refreshTokenID }, 'Logout attempt with non-existent refresh token');
			return;
		}

		// Validate the refresh token
		const isValid = await argon2.verify(refreshTokenRecord.hash, refreshToken);
		if (!isValid) {
			log.warn({ refreshTokenID }, 'Logout attempt with invalid refresh token');
			return;
		}

		// Delete the refresh token from the database
		await prisma.refreshToken.delete({ where: { id: refreshTokenID } });
		log.debug({ refreshTokenID }, 'Refresh token deleted from database');
		log.info({ userId: refreshTokenRecord.user.id }, 'User logged out successfully');
	}
}