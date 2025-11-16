import {z} from "zod";
import ms from "ms";

export const BanRequestSchema = z.object({
    username: z.string('Username is required')
        .min(1, 'Username is required')
        .trim(),
    adminName: z.string().trim().optional(),
    startAt: z.iso.datetime().default(() => new Date().toISOString()),
    duration: z.union([
        z.string().regex(/^\d+(ms|s|m|h|d|w|y)$/, 'Invalid ms duration format'),
        z.number(),
    ]).transform((value) => {
        if (typeof value === "number") return value;
        return ms(value as ms.StringValue);
    }).optional(),
    reason: z.string('Reason of the ban is required')
        .min(1, 'Reason of the ban is required')
        .trim(),
});
export type BanRequest = z.infer<typeof BanRequestSchema>;

export const UnBanRequestSchema = z.object({
    username: z.string('Username is required')
        .min(1, 'Username is required')
        .trim(),
});
export type UnBanRequest = z.infer<typeof UnBanRequestSchema>;