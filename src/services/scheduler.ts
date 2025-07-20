// src/services/scheduler.ts
import cron from 'node-cron';
import { config } from '../config';
import { logInfo, logError } from '../utils/logger';
import { updateData } from './dataManager';
import { uploadData } from './ftpUploader';

let retryTimeout: NodeJS.Timeout | null = null;

async function executeJob(): Promise<void> {
	try {
		logInfo('Executing scheduled job', 'SCHEDULER');

		await updateData();
		await uploadData();

		logInfo('Scheduled job completed successfully', 'SCHEDULER');
	} catch (error) {
		logError('Scheduled job failed', error, 'SCHEDULER');
		scheduleRetry();
	}
}

function scheduleRetry(): void {
	if (retryTimeout) {
		clearTimeout(retryTimeout);
	}

	retryTimeout = setTimeout(() => {
		logInfo('Retrying scheduled job', 'SCHEDULER');
		executeJob();
	}, config.retryDelay);
}

export function startScheduler(): void {
	try {
		logInfo('Starting scheduler', 'SCHEDULER');

		// Run immediately
		executeJob();

		// Schedule periodic execution
		cron.schedule(config.cronExpression, () => executeJob());

		logInfo(`Scheduler started with expression: ${config.cronExpression}`, 'SCHEDULER');
	} catch (error) {
		logError('Failed to start scheduler', error, 'SCHEDULER');
		throw error;
	}
}
