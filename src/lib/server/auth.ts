
import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import log from '$lib/server/log';
import prisma from '$lib/server/prisma';
import { sendEmail, verificationTemplate } from '$lib/server/email';
import { APP_URL, HMAC_SECRET, JWT_SECRET } from '$env/static/private';

import type { User } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import type { ErrorStatus } from 'sveltekit-superforms';

// Types

type AccessTokenPayload = {
	userID: string | null;
};

// Errors

export enum AuthErrorCode {
	MissingUser = 'missing_user',
	MissingToken = 'missing_token',
	TokenNotFound = 'token_not_found',
	InvalidToken = 'invalid_token',
	ExpiredToken = 'expired_token'
}

export class AuthError extends Error {
	readonly code?: AuthErrorCode;
	readonly status: ErrorStatus;

	constructor(status: ErrorStatus, message: string, code?: AuthErrorCode) {
		super(message);
		this.code = code;
		this.status = status;
		this.name = 'AuthError';
	}
}

// Tokens

function generateToken() {
	return crypto.randomBytes(32).toString('base64url');
}

function deriveTokenID(token: string) {
	return crypto
		.createHmac('sha256', HMAC_SECRET)
		.update(token)
		.digest('base64url');
}

function decodeJWT(token: string): AccessTokenPayload {
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

export async function register(username: string, email: string, password: string) {
	return await prisma.user.create({
		data: {
			username,
			email,
			password: await argon2.hash(password)
		}
	});
}

export async function login(event: RequestEvent, user: User) {

	// Create access token
	const accessToken = jwt.sign(
		{ userID: user.id },
		JWT_SECRET,
		{ expiresIn: 60 * 15 } // 15 minutes
	);

	// Create refresh token
	const refreshToken = generateToken();
	const refreshTokenID = deriveTokenID(refreshToken);
	const refreshTokenHash = await argon2.hash(refreshToken);

	await prisma.refreshToken.create({
		data: {
			id: refreshTokenID,
			hash: refreshTokenHash,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			userID: user.id,
			userAgent: event.request.headers.get('user-agent'),
			ipAddress: event.getClientAddress()
		}
	});

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
	log.info({ userID: user.id }, 'User logged in successfully');
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
			log.warn({ tokenID: refreshTokenID }, 'Logout attempt with non-existent refresh token');
			return;
		}

		// Validate the refresh token
		const isValid = await argon2.verify(refreshTokenData.hash, refreshToken);
		if (!isValid) {
			log.warn({ tokenID: refreshTokenID }, 'Logout attempt with invalid refresh token');
			return;
		}

		// Check if user and token match
		if (event.locals.user && event.locals.user.id !== refreshTokenData.user.id) {
			log.warn({ userID: event.locals.user.id, tokenID: refreshTokenID }, 'Logout attempt with mismatched refresh token');
			return;
		}

		// Delete the refresh token from the database
		await prisma.refreshToken.delete({ where: { id: refreshTokenID } });
		log.info({ userID: refreshTokenData.user.id }, 'User logged out successfully');
	}
}

export async function requestVerification(user: User) {

	// Create a new verification token
	const verificationToken = generateToken();
	const verificationTokenID = deriveTokenID(verificationToken);
	const verificationTokenHash = await argon2.hash(verificationToken);

	await prisma.verificationToken.create({
		data: {
			id: verificationTokenID,
			hash: verificationTokenHash,
			expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
			userID: user.id,
		}
	});

	// Send the verification email
	const verificationUrl = `${APP_URL}/auth/verify?token=${verificationToken}`;
	await sendEmail(user.email, 'Verify your email', verificationTemplate(user.username, verificationUrl));
	log.info({ userID: user.id }, 'Verification email sent successfully');
}

export async function tryVerificationToken(event: RequestEvent) {

	// Get verification token
	const verificationToken = event.url.searchParams.get('token')
	if (!verificationToken) {
		log.warn('No verification token provided');
		throw new AuthError(400, 'No verification token provided', AuthErrorCode.MissingToken);
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
		throw new AuthError(403, 'Invalid verification token provided', AuthErrorCode.TokenNotFound);
	}

	// Verify the token hash
	const isValid = await argon2.verify(verificationTokenData.hash, verificationToken);
	if (!isValid) {
		log.warn({ tokenID: verificationTokenID }, 'Invalid verification token provided');
		throw new AuthError(403, 'Invalid verification token provided', AuthErrorCode.InvalidToken);
	}

	// Delete the verification token
	await prisma.verificationToken.delete({ where: { id: verificationTokenID } });

	// Check if the verification token is expired
	const isExpired = verificationTokenData.expiresAt < new Date();
	if (isExpired) {
		log.warn({ tokenID: verificationTokenID }, 'Expired verification token provided');
		throw new AuthError(403, 'Expired verification token provided', AuthErrorCode.ExpiredToken);
	}

	// Verify the user
	await prisma.user.update({
		where: { id: verificationTokenData.userID },
		data: { verified: true }
	});

	// Delete all other verification tokens
	await prisma.verificationToken.deleteMany({
		where: {
			userID: verificationTokenData.userID,
		}
	 });

	// Log in if not already
	if (event.locals.user != verificationTokenData.user) {
		if (event.locals.user)
			await logout(event);
		await login(event, verificationTokenData.user);
	}

	log.info({ userID: verificationTokenData.userID }, 'User verified successfully');
}

export async function tryAccessToken(event: RequestEvent) {

	// Get access token
	const accessToken = event.cookies.get('access_token');
	if (!accessToken) {
		log.debug('No access token provided')
		throw new AuthError(400, 'No access token provided', AuthErrorCode.MissingToken)
	}

	// Verify access token
	const { userID } = decodeJWT(accessToken);
	if (!userID) {
		event.cookies.delete('access_token', { path: '/' });
		log.warn('Invalid/expired access token provided');
		throw new AuthError(403, 'Invalid/expired access token provided', AuthErrorCode.InvalidToken)
	}

	// Get user from database
	const user = await prisma.user.findUnique({
		where: { id: userID },
	});

	if (!user) {
		log.warn({ userID }, 'Valid access token provided, but user does not exist in database');
		throw new AuthError(500, 'User not found in database', AuthErrorCode.MissingUser)
	}

	// Login
	event.locals.user = user;
}

export async function tryRefreshToken(event: RequestEvent) {

	// Get refresh token
	const refreshToken = event.cookies.get('refresh_token')
	if (!refreshToken) {
		log.debug('No refresh token provided')
		throw new AuthError(400, 'No refresh token provided', AuthErrorCode.MissingToken)
	}

	// Derive the database ID for the refresh token
	const refreshTokenID = deriveTokenID(refreshToken);
	const refreshTokenData = await prisma.refreshToken.findUnique({
		where: { id: refreshTokenID },
		include: { user: true }
	});

	// Check if the verification token exists in the database
	if (!refreshTokenData) {
		log.warn({ tokenID: refreshTokenID }, 'Refresh token not found in database');
		throw new AuthError(403, 'Invalid refresh token provided', AuthErrorCode.TokenNotFound);
	}

	// Verify the token hash
	const isValid = await argon2.verify(refreshTokenData.hash, refreshToken);
	if (!isValid) {
		log.warn({ tokenID: refreshTokenID }, 'Invalid refresh token provided');
		throw new AuthError(403, 'Invalid refresh token provided', AuthErrorCode.InvalidToken);
	}

	// Delete the refresh token after use
	await prisma.refreshToken.delete({ where: { id: refreshTokenID } });

	// Check if the refresh token is expired
	const isExpired = refreshTokenData.expiresAt < new Date();
	if (isExpired) {
		log.warn({ tokenID: refreshTokenID }, 'Expired refresh token provided');
		throw new AuthError(403, 'Expired refresh token provided', AuthErrorCode.ExpiredToken);
	}

	// Create new tokens and login user
	await login(event, refreshTokenData.user);
}