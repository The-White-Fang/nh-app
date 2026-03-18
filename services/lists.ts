import { api } from '@/helpers/config';
import { getJwt } from './auth';
import * as SecureStore from 'expo-secure-store';
import { auth_key } from '@/context/auth_context';

export type ListOverview = {
	id: number;
	name: string;
	description: string | null;
	is_pinned: boolean;
	item_count: number;
	preview_images: string[];
	created_at: string;
};

export type ListItem = {
	id: number;
	anime_id: number;
	title: string;
	image_url: string;
	added_at: string;
};

export type ListDetail = ListOverview & {
	items: ListItem[];
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

export async function fetchLists(): Promise<ListOverview[]> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists`, { headers });
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to fetch lists');
	return body.lists as ListOverview[];
}

export async function fetchListDetail(id: number): Promise<ListDetail> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists/${id}`, { headers });
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to fetch list');
	return body as ListDetail;
}

export async function createList(name: string, description?: string): Promise<ListOverview> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ name, description }),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to create list');
	return body as ListOverview;
}

export async function updateList(id: number, data: { name?: string; description?: string }): Promise<ListOverview> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists/${id}`, {
		method: 'PATCH',
		headers,
		body: JSON.stringify(data),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to update list');
	return body as ListOverview;
}

export async function deleteList(id: number): Promise<void> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists/${id}`, {
		method: 'DELETE',
		headers,
	});
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new Error(body?.message || 'Failed to delete list');
	}
}

export async function togglePin(id: number): Promise<boolean> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists/${id}/pin`, {
		method: 'PATCH',
		headers,
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to toggle pin');
	return body.is_pinned as boolean;
}

export async function addAnimeToList(listId: number, animeId: number): Promise<ListItem> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists/${listId}/items`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ anime_id: animeId }),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to add anime');
	return body as ListItem;
}

export async function removeAnimeFromList(listId: number, itemId: number): Promise<void> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/anime/lists/${listId}/items/${itemId}`, {
		method: 'DELETE',
		headers,
	});
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new Error(body?.message || 'Failed to remove anime');
	}
}
