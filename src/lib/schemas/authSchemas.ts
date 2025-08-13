
import { z } from 'zod';

export const registerSchema = z.object({
		username: z.string()
			.min(1, { message: 'Username is required.' })
			.max(20, { message: 'Username cannot be longer than 20 chars'}),
		email: z.string()
			.min(1, { message: 'Email is required.' })
			.email({ message: 'Invalid email address.' }),
		password: z.string()
			.min(1, { message: 'Password is required.' }),
		confirmPassword: z.string()
			.min(1, { message: 'Confirm password is required.' })
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	})

export const loginSchema = z.object({
	email: z.string()
		.min(1, { message: 'Email is required.' })
		.email({ message: 'Invalid email address.' }),
	password: z.string()
		.min(1, { message: 'Password is required.' })
})

export const changeUsernameSchema = z.object({
	username: z.string()
		.min(1, { message: 'Username is required.' })
		.max(20, { message: 'Username cannot be longer than 20 chars'})
})

export const changeEmailSchema = z.object({
	password: z.string()
		.min(1, { message: 'Password is required.' }),
	email: z.string()
		.min(1, { message: 'Email is required.' })
		.email({ message: 'Invalid email address.' })
})

export const changePasswordSchema = z.object({
		oldPassword: z.string()
			.min(1, { message: 'Old password is required.' }),
		newPassword: z.string()
			.min(1, { message: 'New password is required.' }),
		confirmPassword: z.string()
			.min(1, { message: 'New password is required.' })
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	})	