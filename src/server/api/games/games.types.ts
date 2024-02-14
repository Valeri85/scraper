import { z } from 'zod';
import { GameSchema, GamesSchema } from './games.model';

export type GameType = z.infer<typeof GameSchema>;
export type GamesType = z.infer<typeof GamesSchema>;
