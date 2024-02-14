import z from 'zod';

export const LinkSchema = z.object({
	type: z.string(),
	link: z.string(),
	id_web: z.number().or(z.string()),
});

export const LinksSchema = z.record(z.array(LinkSchema));
