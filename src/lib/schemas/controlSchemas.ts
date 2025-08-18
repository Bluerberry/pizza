
import { z } from 'zod';

export const NCSLimitsSchema = z.object({

	// Time
	initialTime: z.discriminatedUnion('type', [
		z.object({ 
			type: z.literal('EXACT'),
			duration: z.number()
				.min(0, 'Must be in the future.')
		}),
		z.object({
			type: z.literal('RANGE'),
			min: z.number()
				.min(0, 'Must be in the future.'),
			max: z.number()
				.min(0, 'Must be in the future.')
		})
	]).refine(data => data.type === 'EXACT' || data.min <= data.max, {
		message: 'Must be longer than min time.',
		path: ['initialTime', 'max']
	}),

	maxiumTime: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('NONE')
		}),
		z.object({
			type: z.literal('DATE'),
			date: z.date()
		}),
		z.object({
			type: z.literal('DURATION'),
			duration: z.number()
				.min(0, 'Must be in the future.')	
		})
	]),

	// Kinks
	anal: z.boolean(),
	oral: z.boolean(),
	edging: z.boolean(),
	cei: z.boolean(),
	public: z.boolean(),
	feminization: z.boolean(),
	bondage: z.boolean(),
	hypnosis: z.boolean(),
	shopping: z.boolean(),
	keyplay: z.boolean()
})

export const NCSBehaviourSchema = NCSLimitsSchema.extend({
	sentiment: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('RANGE'),
			min: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.'),
			max: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.')
		}),
		z.object({
			type: z.literal('EXACT'),
			mood: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.')
		})
	]).refine(data => data.type === 'EXACT' || data.min <= data.max, {
		message: 'Must be bigger than min mood.',
		path: ['initialMood', 'max']
	}),

	malevolence: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('RANGE'),
			min: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.'),
			max: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.')
		}),
		z.object({
			type: z.literal('EXACT'),
			mood: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.')
		})
	]).refine(data => data.type === 'EXACT' || data.min <= data.max, {
		message: 'Must be bigger than min vengefullness.',
		path: ['vengefulness', 'max']
	}),

	capriciousness: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('RANGE'),
			min: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.'),
			max: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.')
		}),
		z.object({
			type: z.literal('EXACT'),
			mood: z.number()
				.min(0, 'Must be between 0 and 1.')
				.max(1, 'Must be between 0 and 1.')
		})
	]).refine(data => data.type === 'EXACT' || data.min <= data.max, {
		message: 'Must be bigger than min vengefullness.',
		path: ['vengefulness', 'max']
	}),
})

export const newControlSessionSchema = NCSBehaviourSchema;