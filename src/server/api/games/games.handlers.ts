import { IncomingMessage, ServerResponse } from 'node:http';
import { sendSlackNotification } from '../../../config/notify';
import { getData } from '../../../data/getData';
import { GamesSchema } from './games.model';
const data = '../../../data/data.json';

export async function getGames(request: IncomingMessage, response: ServerResponse) {
	try {
		const gamesData = await getData(data);
		const parsedGamesData = GamesSchema.parse(JSON.parse(JSON.stringify(gamesData)));

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(200, { 'Content-Type': 'application/json' });

		response.write(parsedGamesData);
		response.end();
		// response.end(JSON.stringify(data));
	} catch (error) {
		if (error instanceof Error) {
			console.log('error message: ', error.message);
			sendSlackNotification('#back-end', error.message);
			throw new Error(error.message);
		} else {
			console.log('unexpected error: ', error);
			sendSlackNotification('#back-end', 'An unexpected error occurred');
			throw new Error('An unexpected error occurred');
		}
	}
}
