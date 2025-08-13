
import log from '$lib/server/log';
import type { Handle } from '@sveltejs/kit';

export const logging: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	const duration = Date.now() - start;

	log.debug({
		method: event.request.method,
		path: event.url.pathname,
		status: response.status,
		duration: `${duration}ms`
	}, 'HTTP Request');

	return response;
};
