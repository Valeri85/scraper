import { GamesType } from '../server/api/games/games.types';
import { LinkType } from '../server/api/links/links.types';

export interface DataType {
	games: GamesType;
	links: LinkType;
}
