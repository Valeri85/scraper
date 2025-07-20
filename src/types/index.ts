export interface Game {
	id: string;
	id_sport: number;
	sport: string;
	date: string;
	match: string;
	competition: string;
	country: string;
}

export interface Link {
	type: string;
	link: string;
	id_web: number | string;
}

export interface AppData {
	games: Game[];
	links: Record<string, Link[]>;
}

export interface Config {
	port: number;
	slackToken: string;
	slackChannel: string;
	scrapeUrl: string;
	dataFilePath: string;
	cronExpression: string;
	retryDelay: number;
	ftp: {
		host: string;
		port: number;
		user: string;
		password: string;
		remotePath: string;
	};
}
