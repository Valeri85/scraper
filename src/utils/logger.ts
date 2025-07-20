// src/utils/logger.ts
import https from 'https';
import querystring from 'querystring';
import { config } from '../config';

async function sendSlackNotification(message: string): Promise<void> {
	try {
		const postData = querystring.stringify({
			token: config.slackToken,
			channel: config.slackChannel,
			text: message,
		});

		const options = {
			hostname: 'slack.com',
			path: '/api/chat.postMessage',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData),
			},
		};

		await new Promise<void>((resolve, reject) => {
			const request = https.request(options, response => {
				let data = '';
				response.on('data', chunk => (data += chunk));
				response.on('end', () => {
					if (response.statusCode === 200) {
						resolve();
					} else {
						reject(new Error(`Slack API error: ${data}`));
					}
				});
			});

			request.on('error', reject);
			request.write(postData);
			request.end();
		});
	} catch (error) {
		console.error('Failed to send Slack notification:', error);
	}
}

export function logInfo(message: string, context?: string): void {
	const logMessage = context ? `[${context}] ${message}` : message;
	console.log(logMessage);
}

export function logError(message: string, error?: unknown, context?: string): void {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const logMessage = context ? `[${context}] ${message}: ${errorMessage}` : `${message}: ${errorMessage}`;

	console.error(logMessage);
	sendSlackNotification(logMessage).catch(() => {
		// Fail silently for Slack notifications to avoid infinite loops
	});
}

export async function notifySuccess(message: string, context?: string): Promise<void> {
	const logMessage = context ? `[${context}] ${message}` : message;
	console.log(logMessage);

	try {
		await sendSlackNotification(logMessage);
	} catch (error) {
		console.error('Failed to send success notification to Slack:', error);
	}
}
