import { IncomingMessage, ServerResponse } from 'node:http';
import { sendSlackNotification } from '../../../config/notify';
import { getData } from '../../../data/getData';
import { LinksSchema } from './links.model';
const data = '../../../data/data.json';

export async function getLinks(request: IncomingMessage, response: ServerResponse) {
	try {
		const linksDAta = await getData(data);
		const parsedLinksData = LinksSchema.parse(JSON.parse(JSON.stringify(linksDAta)));

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		// response.writeHead(200, { 'Content-Type': 'application/json' });

		response.write(parsedLinksData);
		response.end();
		// response.end(JSON.stringify(data));
	} catch (error) {
		if (error instanceof Error) {
			console.log('error message: ', error.message);
			sendSlackNotification('#back-end', error.message);
			throw new Error(error.message);
		} else {
			console.log('unexpected error: ', error);
			sendSlackNotification('#back-end', 'An unexpected error occurred');
			throw new Error('An unexpected error occurred');
		}
	}
}
