
import log from '$lib/server/log';
import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { zod } from 'sveltekit-superforms/adapters';
import { Permission } from '$lib/scripts/permissions';
import { superValidate, message } from 'sveltekit-superforms';
import { newControlSessionSchema } from '$lib/schemas/controlSchemas';

export const load = async ({ parent }) => {

	// Route protected by layout

	const { session } = await parent();
	if (session) {
		redirect(303, './dashboard');
	}

	return { 
		newControlSessionForm: await superValidate(zod(newControlSessionSchema)) 
	};
};