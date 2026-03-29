import { api } from '@/helpers/config';
import { getJwt } from './auth';

export async function updateProfilePicture(sessionToken: string, fileUri: string): Promise<string> {
	const jwt = await getJwt(sessionToken);
	const formData = new FormData();
	
	const uriParts = fileUri.split('.');
	const fileType = uriParts[uriParts.length - 1];

	// @ts-ignore
	formData.append('image', {
		uri: fileUri,
		name: `photo.${fileType}`,
		type: `image/${fileType}`,
	});

	const response = await fetch(`${api}/v1/user/profile-picture`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${jwt}`,
			'Accept': 'application/json',
		},
		body: formData,
	} as any);

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const message = body?.message ? (Array.isArray(body.message) ? body.message[0] : body.message) : 'Upload failed.';
		throw new Error(message);
	}

	return body.image as string;
}
