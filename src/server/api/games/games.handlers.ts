import { IncomingMessage, ServerResponse } from 'node:http';
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
		console.log(error);
	}
}
