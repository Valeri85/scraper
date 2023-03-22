import data from '../../../data/data.json';
import z from 'zod';

const LinksSchema = z.record(
	z.array(
		z.object({
			type: z.string(),
			link: z.string(),
			id_web: z.number().or(z.string()),
		})
	)
);

const Links = LinksSchema.parse(JSON.parse(data.links));

export function getLinksData() {
	return new Promise((resolve, reject) => resolve(JSON.stringify(Links)));
}
