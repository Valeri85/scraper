import data from '../../../data/data.json';
import z from 'zod';

const GamesSchema = z.array(
	z.object({
		id: z.string(),
		id_sport: z.number(),
		sport: z.string(),
		date: z.string(),
		match: z.string(),
		competition: z.string(),
		country: z.string(),
	})
);

const Games = GamesSchema.parse(JSON.parse(data.games));

export function getGamesData(): Promise<string> {
	return new Promise((resolve, reject) => resolve(JSON.stringify(Games)));
}
