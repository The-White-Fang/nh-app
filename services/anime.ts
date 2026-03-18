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

export type NameEntity = { id: number; name: string; };

export type AnimeSearchRecord = {
    id: number;
    title: string;
    status: string | null;
    episodes: number | null;
    image_url: string;
    genres: NameEntity[];
    synopsis: string;
    type: string | null;
};

export type AnimeSearchResponse = {
    animes: AnimeSearchRecord[];
};

export type AnimeSearchParams = {
    search?: string;
    genres?: number[];
    producers?: number[];
    licensors?: number[];
    studios?: number[];
    themes?: number[];
    streaming_services?: number[];
    page?: number;
    page_size?: number;
};

export async function fetch_animes(params: AnimeSearchParams) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    const arrayKeys = ['genres', 'producers', 'licensors', 'studios', 'themes', 'streaming_services'] as const;
    arrayKeys.forEach((key) => {
        const arr = params[key];
        if (arr && arr.length > 0) {
            arr.forEach(val => query.append(key, val.toString()));
        }
    });

    const response = await fetch(`${api}/v1/anime/search?${query.toString()}`);
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(body?.message || 'Failed to fetch animes');
    }

    return body as AnimeSearchResponse;
}

export async function fetch_anime_by_id(id: number) {
	const response = await fetch(`${api}/v1/anime/${id}`);
	const body = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(body?.message || 'Failed to fetch anime details');
	}

	return body;
}

export async function refresh_anime(id: number) {
	// Dummy function that pings Jikan in the future
	return new Promise((resolve) => setTimeout(resolve, 1000));
}
