import { IncomingMessage, ServerResponse } from 'node:http';
import { getLinksData } from './links';

export async function getLinks(request: IncomingMessage, response: ServerResponse) {
	try {
		const data: any = await getLinksData();

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
