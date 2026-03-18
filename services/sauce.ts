import { api } from '@/helpers/config';

export type SauceNameEntity = {
	id: number;
	name: string;
};

export type FetchSauceFilterResponse = {
	tags: SauceNameEntity[];
	parodies: SauceNameEntity[];
	artists: SauceNameEntity[];
	characters: SauceNameEntity[];
	groups: SauceNameEntity[];
	languages: SauceNameEntity[];
	categories: SauceNameEntity[];
};

export type SauceSearchRecord = {
	id: number;
	title: string;
	cover: string | null;
	pages: number;
	tags: SauceNameEntity[];
};

export type SauceSearchResponse = {
	sauces: SauceSearchRecord[];
};

export type SauceSearchParams = {
	search?: string;
	tags?: number[];
	parodies?: number[];
	artists?: number[];
	characters?: number[];
	groups?: number[];
	languages?: number[];
	categories?: number[];
	page?: number;
	page_size?: number;
};

export async function fetch_sauce_filters(): Promise<FetchSauceFilterResponse> {
	const response = await fetch(`${api}/v1/sauce/filters`);
	if (!response.ok) {
		throw new Error('Failed to fetch sauce filters');
	}
	return response.json();
}

export async function fetch_sauces(params: SauceSearchParams): Promise<SauceSearchResponse> {
	const query_params = new URLSearchParams();
	if (params.search) query_params.append('search', params.search);
	if (params.page) query_params.append('page', params.page.toString());
	if (params.page_size) query_params.append('page_size', params.page_size.toString());

	const filter_keys: (keyof SauceSearchParams)[] = ['tags', 'parodies', 'artists', 'characters', 'groups', 'languages', 'categories'];
	filter_keys.forEach((key) => {
		const val = params[key];
		if (Array.isArray(val)) {
			val.forEach((id) => query_params.append(key, id.toString()));
		}
	});

	const response = await fetch(`${api}/v1/sauce/search?${query_params.toString()}`);
	if (!response.ok) {
		throw new Error('Failed to fetch sauce content');
	}
	return response.json();
}

export async function fetch_sauce_by_id(id: number): Promise<any> {
	const response = await fetch(`${api}/v1/sauce/${id}`);
	if (!response.ok) {
		throw new Error('Failed to fetch sauce details');
	}
	return response.json();
}

export async function refresh_sauce(id: number) {
	// Dummy placeholder function
	return new Promise((resolve) => setTimeout(resolve, 1000));
}
