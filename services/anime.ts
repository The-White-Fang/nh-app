import { api } from '@/helpers/config';

export type Filter = {
	id: number;
	name: string;
};

export type FetchFilterResponse = {
	genres: Filter[];
	producers: Filter[];
	licensors: Filter[];
	studios: Filter[];
	themes: Filter[];
	streaming_services: Filter[];
};

export type AnimeShort = {
	id: number;
	image_url: string;
	title: string;
	genres: {
		id: number;
		name: string;
	}[];
	type: string | null;
	episodes: number | null;
	status: string | null;
	synopsis: string;
};

export async function fetch_filters() {
	const response = await fetch(`${api}/v1/anime/filters`);

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = response.status >= 500 ? 'Server error while loading filters. Please try again later.' : 'Unable to load filters.';
		throw new Error(body?.message || fallback);
	}

	return body as FetchFilterResponse;
}

export async function search_anime(search_query: string, filter: Record<keyof FetchFilterResponse, number[]>, page: number = 1, page_size: number = 20) {
	const params = new URLSearchParams();

	params.set('search', search_query);
	params.set('page', page.toString());
	params.set('page_size', page_size.toString());

	for (const key in filter) {
		const value = filter[key as keyof FetchFilterResponse];

		if (!value.length) {
			continue;
		}

		for (const id of value) {
			params.append(key, id.toString());
		}
	}

	const response = await fetch(`${api}/v1/anime/search?${params.toString()}`);

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = response.status >= 500 ? 'Server error while loading animes. Please try again later.' : 'Unable to load animes.';
		throw new Error(body?.message || fallback);
	}

	return body as { animes: AnimeShort[] };
}
