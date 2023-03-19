import { IncomingMessage, ServerResponse } from 'node:http';
import { API_ROUTE, LINKS } from '../../../constants';
import { getLinks } from './links.handlers';

export function linksRoutes(request: IncomingMessage, response: ServerResponse) {
	if (request.url === `${API_ROUTE}/${LINKS}` && request.method === 'GET') getLinks(request, response);
}
