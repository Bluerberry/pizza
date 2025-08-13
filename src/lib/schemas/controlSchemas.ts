
import { z } from 'zod';

export const newControlSchema = z.object({
		releaseAt: z
			.date()
			.min(new Date(), { message: 'Must be in the future.' }),
		maxReleaseAt: z
			.date()
			.min(new Date(), { message: 'Must be in the future.' })
			.nullable(),
		files: z
			.instanceof(File, { message: 'Please upload a file.' })
			.refine((f) => f.size < 500_000, 'Max 500 kB upload size.')
			.array()
	}).refine(data => data.maxReleaseAt && data.releaseAt < data.maxReleaseAt, {
		message: 'Must be after release date.',
		path: ['maxReleaseAt']
	});