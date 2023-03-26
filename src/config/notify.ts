import https, { RequestOptions } from 'node:https';
import querystring from 'node:querystring';

const SLACK_BOT_TOKEN = 'xoxb-4994319332933-4990747693078-xXB0srvjSgIrPLAB4uSsNkSQ';

export function sendSlackNotification(channel: string, message: string) {
	const postData = querystring.stringify({
		token: SLACK_BOT_TOKEN,
		channel: channel,
		text: message,
	});

	const options: RequestOptions = {
		hostname: 'slack.com',
		path: '/api/chat.postMessage',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length,
		},
	};

	const request = https.request(options, response => {
		let data = '';
		response.on('data', chunk => (data += chunk));
		response.on('end', () => {
			if (response.statusCode === 200) console.log('Slack notification sent successfully');
			else console.error('Error sending Slack notification:', data);
		});
	});
	request.on('error', error => console.error('Error sending Slack notification:', error));
	request.write(postData);
	request.end();
}
