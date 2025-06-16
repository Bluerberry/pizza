
import { sequence } from '@sveltejs/kit/hooks';
import { logging, auth, csrf } from '$lib/server/hooks';

export const handle = sequence(logging, auth, csrf);
