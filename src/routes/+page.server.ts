import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { Resolver } from 'node:dns';

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
	const query = decodeURIComponent(url.searchParams.get('query') ?? '');

	if (!query || query.length < 3) {
		return {
			pageContent: Promise.resolve(''),
			query: ''
		};
	}

	try {
		const url = new URL(query);
		if (!url.protocol || !url.host) {
			error(400, 'Invalid URL');
		}

		await dnsLookup(url.host);
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(err);
			error(400, err.message);
		}

		error(400, 'Invalid URL');
	}

	const contentReq = await fetch(`${env.BROWSERLESS_HOST}/content?token=${env.BROWSERLESS_TOKEN}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache'
		},
		body: JSON.stringify({
			url: query,
			gotoOptions: { waitUntil: 'networkidle2' }
		})
	}).catch(() => {
		error(500, 'Failed to fetch content for browser');
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

function dnsLookup(host: string) {
	if (!env.DNS_SERVER) {
		return Promise.resolve();
	}

	const resolver = new Resolver();
	resolver.setServers([env.DNS_SERVER]);

	return new Promise<void>((resolve, reject) => {
		resolver.resolve4(host, (err: Error) => {
			if (err) {
				reject(new Error(`Failed to resolve DNS for ${host}. This might be intentional.`));
			}

			resolve();
		});
	});
}
