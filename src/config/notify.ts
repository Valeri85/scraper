import https, { RequestOptions } from 'node:https';
import querystring from 'node:querystring';
import { HOSTNAME, PATH, SLACK_BOT_TOKEN, slackErrorMessage } from '../constants';

export async function sendSlackNotification(channel: string, message: string): Promise<void> {
	const postData = querystring.stringify({
		token: SLACK_BOT_TOKEN,
		channel,
		text: message,
	});

	const options: RequestOptions = {
		hostname: HOSTNAME,
		path: PATH,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(postData),
		},
	};

	return new Promise((resolve, reject) => {
		const request = https.request(options, response => {
			let data = '';
			response.on('data', chunk => (data += chunk));
			response.on('end', () => {
				if (response.statusCode === 200) resolve();
				else reject(new Error(`${slackErrorMessage}: ${data}`));
			});
		});
		request.on('error', error => {
			reject(error);
		});

		request.write(postData);
		request.end();
	});
}
