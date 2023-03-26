import { IncomingMessage, ServerResponse } from 'node:http';
import { sendSlackNotification } from '../../../config/notify';
import { getGamesData } from './games.model';

export async function getGames(request: IncomingMessage, response: ServerResponse) {
	try {
		const games = await getGamesData();

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(200, { 'Content-Type': 'application/json' });

		response.write(games);
		response.end();
		// response.end(JSON.stringify(data));
	} catch (error) {
		if (error instanceof Error) {
			console.log('error message: ', error.message);
			sendSlackNotification('#back-end', error.message);
			throw new Error(error.message);
			//? return error.message;
		} else {
			console.log('unexpected error: ', error);
			sendSlackNotification('#back-end', 'An unexpected error occurred');
			throw new Error('An unexpected error occurred');
			//? return 'An unexpected error occurred';
		}
	}
}
