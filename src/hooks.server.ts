
import { sequence } from '@sveltejs/kit/hooks';
import { logging, auth, permissions } from '$lib/server/hooks';

export const handle = sequence(logging, auth, permissions);
