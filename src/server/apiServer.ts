// src/server/apiServer.ts
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { config } from '../config';
import { logInfo, logError } from '../utils/logger';
import { readData } from '../services/dataManager';

function sendJSON(res: ServerResponse, data: unknown): void {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, statusCode: number, message: string): void {
	res.statusCode = statusCode;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ error: message }));
}

async function handleGamesRequest(res: ServerResponse): Promise<void> {
	const data = await readData();
	sendJSON(res, data.games);
}

async function handleLinksRequest(res: ServerResponse): Promise<void> {
	const data = await readData();
	sendJSON(res, data.links);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
		return;
	}

	try {
		if (req.url === '/api/v1/games' && req.method === 'GET') {
			await handleGamesRequest(res);
		} else if (req.url === '/api/v1/links' && req.method === 'GET') {
			await handleLinksRequest(res);
		} else {
			sendError(res, 404, 'Not Found');
		}
	} catch (error) {
		logError('API request failed', error, 'API_SERVER');
		sendError(res, 500, 'Internal Server Error');
	}
}

export function startServer(): void {
	const server = createServer(handleRequest);

	server.listen(config.port, () => {
		logInfo(`API Server running on http://localhost:${config.port}`, 'API_SERVER');
		logInfo(`Games endpoint: http://localhost:${config.port}/api/v1/games`, 'API_SERVER');
		logInfo(`Links endpoint: http://localhost:${config.port}/api/v1/links`, 'API_SERVER');
	});
}
