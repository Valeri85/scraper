// src/index.ts
import { startScheduler } from './services/scheduler';
import { startServer } from './server/apiServer';
import { logInfo, logError } from './utils/logger';

async function main(): Promise<void> {
	try {
		logInfo('Starting application', 'MAIN');

		// Start scheduler
		startScheduler();

		// Start API server
		startServer();

		logInfo('Application started successfully', 'MAIN');
	} catch (error) {
		logError('Failed to start application', error, 'MAIN');
		process.exit(1);
	}
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
	logError('Uncaught exception', error, 'PROCESS');
	process.exit(1);
});

process.on('unhandledRejection', reason => {
	logError('Unhandled rejection', reason, 'PROCESS');
	process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
	logInfo('Received SIGINT, shutting down gracefully', 'PROCESS');
	process.exit(0);
});

process.on('SIGTERM', () => {
	logInfo('Received SIGTERM, shutting down gracefully', 'PROCESS');
	process.exit(0);
});

main().catch(error => {
	logError('Main function failed', error, 'MAIN');
	process.exit(1);
});
