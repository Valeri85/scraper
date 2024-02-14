import http from 'node:http';
import { API_ROUTE, GAMES, LINKS, LOCAL_HOST, PORT } from '../constants/index';
import { gamesRoute } from '../server/api/games/games.routes';
import { linksRoute } from '../server/api/links/links.routes';

export const server = http.createServer((request, response) => {
	gamesRoute(request, response);
	linksRoute(request, response);
});

server.listen(PORT, () => {
	console.log(`Server running on ${LOCAL_HOST}:${PORT}`);
	console.log('Games: ', `${LOCAL_HOST}:${PORT}${API_ROUTE}/${GAMES}`);
	console.log('Links: ', `${LOCAL_HOST}:${PORT}${API_ROUTE}/${LINKS}`);
});
