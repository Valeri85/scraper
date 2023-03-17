import http from 'node:http';
// import data from './data/data.json' assert { type: 'json' };
import { PORT } from './constants/index.js';
import { getGames, getLinks } from './controllers/dataController.js';

export const server = http.createServer((request, response) => {
	if (request.url === '/api/games' && request.method === 'GET') {
		getGames(request, response);
	} else if (request.url === '/api/links' && request.method === 'GET') {
		getLinks(request, response);
	} else {
		response.statusCode = 404;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(404, { 'Content-Type': 'application/json' });

		response.write(JSON.stringify({ message: 'Route Not Found' }));
		response.end();
		// response.end(JSON.stringify({ message: 'Route Not Found' })));
	}
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
