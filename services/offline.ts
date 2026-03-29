import * as FileSystem from 'expo-file-system/legacy';

const BASE_DIR = `${FileSystem.documentDirectory}sauce_offline/`;

export interface DownloadProgress {
	id: number;
	total: number;
	downloaded: number;
	isFinished: boolean;
	isError: boolean;
}

const ensureDir = async (dir: string) => {
	const info = await FileSystem.getInfoAsync(dir);
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
	}
};

export const getSauceDir = (id: number) => `${BASE_DIR}${id}/`;

export const isSauceDownloaded = async (id: number, expectedPages: number) => {
	const dir = getSauceDir(id);
	const info = await FileSystem.getInfoAsync(dir);
	if (!info.exists) return false;

	const metaInfo = await FileSystem.getInfoAsync(`${dir}metadata.json`);
	if (!metaInfo.exists) return false;

	try {
		const files = await FileSystem.readDirectoryAsync(dir);
		// Filter for numeric filenames (images)
		const imageFiles = files.filter(f => !isNaN(parseInt(f.split('.')[0], 10)));
		return imageFiles.length >= expectedPages;
	} catch (e) {
		return false;
	}
};

export const downloadSauce = async (
	id: number, 
	mediaId: string, 
	pages: number, 
	extension: string,
	title: string,
	cover: string | null,
	onProgress: (progress: DownloadProgress) => void
) => {
	const dir = getSauceDir(id);
	await ensureDir(dir);

	let downloaded = 0;
	const results = [];

	for (let i = 1; i <= pages; i++) {
		const filename = `${i}.${extension}`;
		const localUri = `${dir}${filename}`;
		const remoteUri = `https://i.nhentai.net/galleries/${mediaId}/${i}.${extension}`;

		const fileInfo = await FileSystem.getInfoAsync(localUri);
		if (fileInfo.exists) {
			downloaded++;
			onProgress({ id, total: pages, downloaded, isFinished: false, isError: false });
			continue;
		}

		try {
			await FileSystem.downloadAsync(remoteUri, localUri);
			downloaded++;
			onProgress({ id, total: pages, downloaded, isFinished: false, isError: false });
		} catch (e) {
			console.error(`Failed to download page ${i} for sauce ${id}:`, e);
			onProgress({ id, total: pages, downloaded, isFinished: false, isError: true });
			return; // Stop on first error for simplicity
		}
	}

	// Download cover/thumbnail for offline use
	let localCover = cover;
	if (cover && mediaId) {
		const coverExt = cover.split('.').pop() || 'jpg';
		const localCoverUri = `${dir}cover.${coverExt}`;
		try {
			await FileSystem.downloadAsync(cover, localCoverUri);
			localCover = localCoverUri;
		} catch (e) {
			console.warn(`Failed to cache cover for sauce ${id}:`, e);
		}
	}

	// Save metadata
	await FileSystem.writeAsStringAsync(`${dir}metadata.json`, JSON.stringify({
		id,
		mediaId,
		pages,
		extension,
		title,
		cover: localCover,
		downloadedAt: new Date().toISOString()
	}));

	onProgress({ id, total: pages, downloaded, isFinished: true, isError: false });
};

export const getLocalPageUri = (id: number, page: number, extension: string) => {
	const dir = getSauceDir(id);
	return `${dir}${page}.${extension}`;
};

export const deleteDownloadedSauce = async (id: number) => {
	const dir = getSauceDir(id);
	const info = await FileSystem.getInfoAsync(dir);
	if (info.exists) {
		await FileSystem.deleteAsync(dir, { idempotent: true });
	}
};

export const getDownloadedSauces = async () => {
	const info = await FileSystem.getInfoAsync(BASE_DIR);
	if (!info.exists) return [];

	try {
		const dirs = await FileSystem.readDirectoryAsync(BASE_DIR);
		const results = [];

		for (const idStr of dirs) {
			const dir = `${BASE_DIR}${idStr}/`;
			const metaPath = `${dir}metadata.json`;
			const metaInfo = await FileSystem.getInfoAsync(metaPath);
			
			if (metaInfo.exists) {
				const content = await FileSystem.readAsStringAsync(metaPath);
				const data = JSON.parse(content);
				
				// Ensure IDs are consistent (numbers)
				const id = data.id || parseInt(idStr, 10);
				
				// Check for local cover
				let cover = data.cover;
				if (cover && !cover.startsWith('file://') && !cover.startsWith('/')) {
					// Fallback: see if cover.jpg exists in dir
					const files = await FileSystem.readDirectoryAsync(dir);
					const coverFile = files.find(f => f.startsWith('cover.'));
					if (coverFile) {
						cover = `${dir}${coverFile}`;
					}
				}

				results.push({
					...data,
					id,
					cover: cover || data.cover,
					title: data.title || 'Unknown Sauce',
					pages: data.pages || 0
				});
			}
		}
		return results;
	} catch (e) {
		console.error('Failed to read downloaded sauces:', e);
		return [];
	}
};
