import { api } from '@/helpers/config';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export type User = {
	id: number;
	username: string;
	image: string | null;
	is_admin: boolean;
};

export type AuthSuccessResponse = {
	token: string;
	user: User;
};

async function getAuthHeaders() {
	let deviceId = '';
	if (Platform.OS === 'android') {
		deviceId = Application.getAndroidId();
	} else if (Platform.OS === 'ios') {
		deviceId = (await Application.getIosIdForVendorAsync()) || 'unknown-device';
	} else {
		deviceId = 'web-device';
	}

	const deviceName = `${Device.brand || 'Unknown'} ${Device.modelName || 'Device'}`;

	return {
		'x-device-id': deviceId,
		'x-device': deviceName,
		'Content-Type': 'application/json',
	};
}

export async function login(username: string, password: string): Promise<AuthSuccessResponse> {
	const headers = await getAuthHeaders();

	const response = await fetch(`${api}/v1/auth/login`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ username, password }),
	});

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = response.status >= 500 ? 'Server error while logging in' : 'Unable to login. Please check your credentials.';
		const message = body?.message ? (Array.isArray(body.message) ? body.message[0] : body.message) : fallback;
		throw new Error(message);
	}

	return body as AuthSuccessResponse;
}

export async function register(username: string, email: string, password: string): Promise<AuthSuccessResponse> {
	const headers = await getAuthHeaders();

	const response = await fetch(`${api}/v1/auth/register`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ username, email, password }),
	});

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = response.status >= 500 ? 'Server error while registering' : 'Unable to register. Please try again.';
		const message = body?.message ? (Array.isArray(body.message) ? body.message[0] : body.message) : fallback;
		throw new Error(message);
	}

	return body as AuthSuccessResponse;
}

export async function getAuthSession(sessionToken: string): Promise<{ jwt: string; user: User }> {
	const headers = await getAuthHeaders();

	const response = await fetch(`${api}/v1/auth/token`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ token: sessionToken }),
	});

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const message = body?.message ? (Array.isArray(body.message) ? body.message[0] : body.message) : 'Session expired. Please login again.';
		throw new Error(message);
	}

	return { jwt: body.jwt as string, user: body.user as User };
}

export async function getJwt(sessionToken: string): Promise<string> {
	const session = await getAuthSession(sessionToken);
	return session.jwt;
}

export async function checkAvailability(param: 'username' | 'email', value: string): Promise<boolean> {
	const response = await fetch(`${api}/v1/auth/check-availability/${param}?value=${encodeURIComponent(value)}`);
	const body = await response.json().catch(() => null);

	if (!response.ok) {
		return false;
	}

	return body?.available as boolean;
}

export async function logout(sessionToken: string): Promise<void> {
	const headers = await getAuthHeaders();

	const response = await fetch(`${api}/v1/auth/logout`, {
		method: 'GET',
		headers: {
			...headers,
			authorization: sessionToken,
		},
	});

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		const message = body?.message ? (Array.isArray(body.message) ? body.message[0] : body.message) : 'Logout failed.';
		throw new Error(message);
	}
}

