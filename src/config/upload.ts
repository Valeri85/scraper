import ftp from 'ftp';
import fs from 'node:fs';
import { sendSlackNotification } from './notify';

const localFilePath = 'src/data/data.json';
const remoteFilePath = 'www/data/data.json';
const serverHost = '31.31.196.245';
const serverPort = 21;
const serverUser = 'u1852176';
const serverPassword = 'Jydcaf621Xh0FCu5';

const client = new ftp();

function upload() {
	client.connect({
		host: serverHost,
		port: serverPort,
		user: serverUser,
		password: serverPassword,
	});

	client.on('ready', () => {
		fs.readFile(localFilePath, (error, data) => {
			if (error) {
				console.error(error.message);
				sendSlackNotification('#back-end', `FTP notification (line 26): 'readFile' error: ${error.message}`);
				throw new Error(`FTP notification (line 27): 'readFile' error: ${error.message}`);
			}
			client.put(data, remoteFilePath, error => {
				if (error) {
					console.error(error.message);
					sendSlackNotification('#back-end', `FTP notification (line 32): 'put' error: ${error.message}`);
					throw new Error(`FTP notification (line 33): 'put' error: ${error.message}`);
				} else {
					console.log(`Successfully uploaded ${localFilePath} to ${remoteFilePath}`);
					sendSlackNotification('#back-end', `FTP notification (line 36): Successfully uploaded data on server`);
				}
				client.end();
			});
		});
	});
}
upload();
