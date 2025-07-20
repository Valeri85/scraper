// src/services/ftpUploader.ts
import Client from 'ftp';
import { promises as fs } from 'fs';
import { config } from '../config';
import { logInfo, logError, notifySuccess } from '../utils/logger';

function connectFTP(client: Client): Promise<void> {
	return new Promise((resolve, reject) => {
		client.connect({
			host: config.ftp.host,
			port: config.ftp.port,
			user: config.ftp.user,
			password: config.ftp.password,
		});

		client.on('ready', resolve);
		client.on('error', reject);
	});
}

function uploadFile(client: Client, data: Buffer): Promise<void> {
	return new Promise((resolve, reject) => {
		client.put(data, config.ftp.remotePath, error => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

export async function uploadData(): Promise<void> {
	const client = new Client();

	try {
		logInfo('Starting FTP upload', 'FTP_UPLOADER');

		await connectFTP(client);
		const fileData = await fs.readFile(config.dataFilePath);
		await uploadFile(client, fileData);

		await notifySuccess('FTP upload completed successfully', 'FTP_UPLOADER');
	} catch (error) {
		logError('FTP upload failed', error, 'FTP_UPLOADER');
		throw error;
	} finally {
		client.end();
	}
}
