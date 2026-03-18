import { api } from '@/helpers/config';
import { getJwt } from './auth';
import * as SecureStore from 'expo-secure-store';
import { auth_key } from '@/context/auth_context';

export type SauceListOverview = {
	id: number;
	name: string;
	description: string | null;
	is_pinned: boolean;
	item_count: number;
	preview_images: string[];
	created_at: string;
};

export type SauceListItem = {
	id: number;
	sauce_id: number;
	title: string;
	image_url: string | null;
	added_at: string;
};

export type SauceListDetail = SauceListOverview & {
	items: SauceListItem[];
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

export async function fetchSauceLists(): Promise<SauceListOverview[]> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/sauce/lists`, { headers });
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to fetch sauce lists');
	return body.lists as SauceListOverview[];
}

export async function fetchSauceListDetail(id: number): Promise<SauceListDetail> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/sauce/lists/${id}`, { headers });
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to fetch sauce list');
	return body as SauceListDetail;
}

export async function createSauceList(name: string, description?: string): Promise<SauceListOverview> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/sauce/lists`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ name, description }),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to create sauce list');
	return body as SauceListOverview;
}

export async function toggleSaucePin(id: number): Promise<boolean> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/sauce/lists/${id}/pin`, {
		method: 'PATCH',
		headers,
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to toggle pin');
	return body.is_pinned as boolean;
}

export async function addSauceToList(listId: number, sauceId: number): Promise<SauceListItem> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/sauce/lists/${listId}/items`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ sauce_id: sauceId }),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(body?.message || 'Failed to add sauce');
	return body as SauceListItem;
}

export async function removeSauceFromList(listId: number, itemId: number): Promise<void> {
	const headers = await getAuthHeader();
	const response = await fetch(`${api}/v1/sauce/lists/${listId}/items/${itemId}`, {
		method: 'DELETE',
		headers,
	});
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new Error(body?.message || 'Failed to remove sauce');
	}
}
