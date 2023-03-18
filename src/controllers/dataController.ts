import { IncomingMessage, ServerResponse } from 'node:http';
import { find } from '../models/dataModel.js';

export async function getGames(request: IncomingMessage, response: ServerResponse) {
	try {
		const data = await find();

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(200, { 'Content-Type': 'application/json' });

		response.write(data.games);
		response.end();
		// response.end(JSON.stringify(data));
	} catch (error) {
		console.log(error);
	}
}

export async function getLinks(request: IncomingMessage, response: ServerResponse) {
	try {
		const data = await find();

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(200, { 'Content-Type': 'application/json' });

		response.write(data.links);
		response.end();
		// response.end(JSON.stringify(data));
	} catch (error) {
		console.log(error);
	}
}
