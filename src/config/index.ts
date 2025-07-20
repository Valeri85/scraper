import { Config } from '../types';

export const config: Config = {
	port: Number(process.env.PORT) || 5000,
	slackToken: process.env.SLACK_BOT_TOKEN || 'xoxb-4994319332933-4990747693078-xXB0srvjSgIrPLAB4uSsNkSQ',
	slackChannel: '#back-end',
	scrapeUrl: 'https://widget.streamsthunder.org/',
	dataFilePath: './src/data/data.json',
	cronExpression: '*/15 * * * *',
	retryDelay: 10000,
	ftp: {
		host: '31.31.196.245',
		port: 21,
		user: 'u1852176',
		password: 'Jydcaf621Xh0FCu5',
		remotePath: 'www/data/data.json',
	},
};
