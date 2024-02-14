import { IncomingMessage, ServerResponse } from 'node:http';
import { API_ROUTE, GAMES } from '../../../constants';
import { getGames } from './games.handlers';

export function gamesRoute(request: IncomingMessage, response: ServerResponse) {
	if (request.url === `${API_ROUTE}/${GAMES}` && request.method === 'GET') getGames(request, response);
}
