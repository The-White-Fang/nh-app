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

	if (!response.ok) {
		throw new Error('Something went wrong');
	}

	return response.json() as Promise<FetchFilterResponse>;
}
