export const api = __DEV__ ? 'http://192.168.1.5:3069' : 'https://api.filthyweebs.in';

export function resolveImageUrl(path: string | null | undefined, placeholder: string = 'https://via.placeholder.com/300'): string {
	if (!path) return placeholder;
	if (path.startsWith('http')) return path;
	if (path.startsWith('/')) return `${api}${path}`;
	return `${api}/${path}`;
}
