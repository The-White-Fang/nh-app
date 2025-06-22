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
};

export async function fetch_filters() {
	const response = await fetch(`${api}/v1/anime/filters`);

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = response.status >= 500 ? 'Server error while loading filters' : 'Unable to load filters. Please try again later.';
		throw new Error(body?.message || fallback);
	}

	return body as FetchFilterResponse;
}
