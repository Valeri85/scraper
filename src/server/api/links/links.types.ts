import { z } from 'zod';
import { LinkSchema, LinksSchema } from './links.model';

export type LinkType = z.infer<typeof LinkSchema>;
export type LinksType = z.infer<typeof LinksSchema>;
