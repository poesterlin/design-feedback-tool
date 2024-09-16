import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
	const query = url.searchParams.get('query');

	if (!query || query.length < 3) {
		return {
			pageContent: Promise.resolve(''),
			query: ''
		};
	}

	const contentReq = await fetch(`${env.BROWSERLESS_HOST}/content?token=${env.BROWSERLESS_TOKEN}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache'
		},
		body: JSON.stringify({
			url: decodeURIComponent(query),
			gotoOptions: { waitUntil: 'networkidle2' }
		})
	});

	if (!contentReq.ok) {
		console.error(await contentReq.text());
		error(500, 'Internal server error');
	}

	cookies.set('lastQuery', query, {
		maxAge: 60 * 60 * 24 * 7, // 1 week
		path: '/',
		sameSite: 'lax',
		secure: true
	});

	return {
		pageContent: contentReq.text(),
		query
	};
};
