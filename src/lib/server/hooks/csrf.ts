
import { json, text } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

// TODO - token based CSRF protection

export const csrf: Handle = async ({ event, resolve }) => {
	const { request, url } = event;
	
	// Get the 'origin' header from the incoming request
	const requestOrigin = request.headers.get('origin');
	
	// Define conditions under which the request is forbidden (potential CSRF attack)
	const forbidden =
		isFormContentType(request) &&									// Checks if the request contains form data
		['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&	// State-changing methods
		requestOrigin !== url.origin									// Origin mismatch
	
	// If forbidden, return a 403 Forbidden response immediately
	if (forbidden) {
		const message = `Cross-site ${request.method} form submissions are forbidden`;
		if (request.headers.get('accept') === 'application/json') {
			return json({ message }, { status: 403 });
		}
		
		return text(message, { status: 403 });
	}

	// If the request passes CSRF checks, continue to the next middleware or endpoint
	return resolve(event);
};

/**
 * Helper function to determine if request content-type indicates a form submission
 */
function isFormContentType(request: Request) {
	const type = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '';
	return ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'].includes(type);
}
