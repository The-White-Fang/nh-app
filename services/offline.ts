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

	// Save metadata
	await FileSystem.writeAsStringAsync(`${dir}metadata.json`, JSON.stringify({
		id,
		mediaId,
		pages,
		extension,
		downloadedAt: new Date().toISOString()
	}));

	onProgress({ id, total: pages, downloaded, isFinished: true, isError: false });
};

export const getLocalPageUri = (id: number, page: number, extension: string) => {
	return `${getSauceDir(id)}${page}.${extension}`;
};

export const deleteDownloadedSauce = async (id: number) => {
	const dir = getSauceDir(id);
	const info = await FileSystem.getInfoAsync(dir);
	if (info.exists) {
		await FileSystem.deleteAsync(dir, { idempotent: true });
	}
};
