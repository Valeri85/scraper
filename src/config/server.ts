import http from 'node:http';
import { PORT } from '../constants/index';
import { gamesRoutes } from '../server/api/games/games.routes';
import { linksRoutes } from '../server/api/links/links.routes';

export const server = http.createServer((request, response) => {
	gamesRoutes(request, response);
	linksRoutes(request, response);

	// if (request.url === `${API_ROUTE}/${GAMES}` && request.method === 'GET') {
	// 	getGames(request, response);
	// } else if (request.url === `${API_ROUTE}/${LINKS}` && request.method === 'GET') {
	// 	getLinks(request, response);
	// } else {
	// 	response.statusCode = 404;
	// 	response.setHeader('Content-Type', 'application/json');
	// 	// response.writeHead(404, { 'Content-Type': 'application/json' });

	// 	response.write(JSON.stringify({ message: 'Route Not Found' }));
	// 	response.end();
	// 	// response.end(JSON.stringify({ message: 'Route Not Found' })));
	// }
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
