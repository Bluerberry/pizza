
import { z } from 'zod';

export const registerSchema = z.object({
		username: z.string()
			.min(1, { message: 'Username is required.' }),
		email: z.string()
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
		.email({ message: 'Invalid email address.' }),
	password: z.string()
		.min(1, { message: 'Password is required.' })
})