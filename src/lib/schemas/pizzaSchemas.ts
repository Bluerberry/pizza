
import { z } from 'zod';

export const pizzaDateSchema = z.object({
	date: z.string()
});

export const pizzaBranchSchema = pizzaDateSchema.extend({
	branchID: z.string()
});

export const pizzaQuantitySchema = pizzaBranchSchema.extend({
	quantity: z.number()
		.gt(0, { message: 'Quantity must be greater than 0.' })
});

export const pizzaRatingSchema = pizzaQuantitySchema.extend({
	rating: z.number()
		.min(1, { message: 'Rating must be at least 1.' })
		.max(5, { message: 'Rating must be at most 5.' })
		.optional(),
	notes: z.string()
		.max(500, { message: 'Notes must be at most 500 characters.' })
		.optional()
});

export const newBranchSchema = z.object({
	name: z.string()
		.min(1, { message: 'Branch name is required.' }),
	address: z.string()
		.min(1, { message: 'Address is required.' }),
	companyID: z.string()
});

export const newCompanySchema = z.object({
	name: z.string()
		.min(1, { message: 'Company name is required.' }),
	website: z.string()
		.url({ message: 'Invalid URL.' })
		.optional()
});