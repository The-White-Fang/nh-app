import { api } from '@/helpers/config';
import { getJwt } from './auth';
import * as SecureStore from 'expo-secure-store';
import { auth_key } from '@/context/auth_context';

export type AnimeProgress = {
	watched_episodes: number;
	is_watched: boolean;
};

export type SauceProgress = {
	read_pages: number;
	is_read: boolean;
};

async function getAuthHeader(): Promise<Record<string, string>> {
	const sessionToken = await SecureStore.getItemAsync(auth_key);
	if (!sessionToken) throw new Error('Not authenticated');
	const jwt = await getJwt(sessionToken);
	return {
		'Authorization': `Bearer ${jwt}`,
		'Content-Type': 'application/json',
	};
}

export async function fetchAnimeProgress(id: number): Promise<AnimeProgress> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/progress/anime/${id}`, { headers });
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to fetch anime progress');
	return body as AnimeProgress;
}

export async function updateAnimeProgress(id: number, data: { episodes?: number; is_watched?: boolean }): Promise<AnimeProgress> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/progress/anime/${id}`, {
		method: 'PATCH',
		headers,
		body: JSON.stringify(data),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to update anime progress');
	return body as AnimeProgress;
}

export async function fetchSauceProgress(id: number): Promise<SauceProgress> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/progress/sauce/${id}`, { headers });
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to fetch sauce progress');
	return body as SauceProgress;
}

export async function updateSauceProgress(id: number, data: { pages?: number; is_read?: boolean }): Promise<SauceProgress> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/progress/sauce/${id}`, {
		method: 'PATCH',
		headers,
		body: JSON.stringify(data),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to update sauce progress');
	return body as SauceProgress;
}
