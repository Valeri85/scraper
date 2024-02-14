import z from 'zod';

export const GameSchema = z.object({
	id: z.string(),
	id_sport: z.number(),
	sport: z.string(),
	date: z.string(),
	match: z.string(),
	competition: z.string(),
	country: z.string(),
});

export const GamesSchema = z.array(GameSchema);
