import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, fetch, params }) => {
	const lastQuery = cookies.get('lastQuery', { decode: decodeURIComponent });
	if (!lastQuery) {
		return new Response('No query found', { status: 404 });
	}

	const path = params.catchall;
	if (path.length < 3) {
		return new Response('Query too short', { status: 400 });
	}

	// path ends with file extension
	const regex = /(?:\.([^.]+))?$/;
	const extension = regex.exec(path)?.at(1);
    
	if (!extension || extension === 'html') {
		// this is not a file request, redirect to analyze the path
		redirect(302, `/?query=${path}`);
	}

	const url = new URL(lastQuery);
	url.pathname = path;

	const content = await fetch(url.toString());

	return new Response(content.body, {
		status: content.status,
		headers: {
			...content.headers,
			'access-control-allow-origin': '*',
			'access-control-allow-headers': 'content-type',
			'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS'
		}
	});
};
