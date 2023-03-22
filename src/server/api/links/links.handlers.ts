import { IncomingMessage, ServerResponse } from 'node:http';
import { getLinksData } from './links.model';

export async function getLinks(request: IncomingMessage, response: ServerResponse) {
	try {
		const links = await getLinksData();

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(200, { 'Content-Type': 'application/json' });

		response.write(links);
		response.end();
		// response.end(JSON.stringify(data));
	} catch (error) {
		console.log(error);
	}
}
