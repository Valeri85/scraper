import http from 'node:http';
import { PORT } from '../constants/index';
import { gamesRoutes } from '../server/api/games/games.routes';
import { linksRoutes } from '../server/api/links/links.routes';

export const server = http.createServer((request, response) => {
	gamesRoutes(request, response);
	linksRoutes(request, response);
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
