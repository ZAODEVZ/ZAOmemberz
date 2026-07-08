import { z } from "zod";
import { isAddress } from "viem";

/** A checksum-agnostic 0x address, normalized to lowercase. */
export const walletSchema = z
  .string()
  // strict:false — accept any casing (lowercase, checksummed, or mixed);
  // consumers shouldn't have to EIP-55-checksum before calling us. We
  // normalize to lowercase ourselves below.
  .refine((v) => isAddress(v, { strict: false }), {
    message: "Invalid EVM address",
  })
  .transform((v) => v.toLowerCase());

/** An http(s) URL. Rejects javascript:/data:/etc. so links/avatars are safe. */
const httpUrlSchema = z
  .string()
  .trim()
  .max(600)
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Must be an http(s) URL" },
  );

export const socialLinkSchema = z.object({
  platform: z.string().trim().min(1).max(40),
  urlOrHandle: z.string().trim().min(1).max(400),
});

/** Fields a profile owner (or admin) may set/update. */
export const profileWritableSchema = z.object({
  displayName: z.string().trim().max(80).nullish(),
  avatarUrl: httpUrlSchema.nullish().or(z.literal("")),
  bio: z.string().trim().max(1000).nullish(),
  discordId: z.string().trim().max(40).nullish(),
  farcasterFid: z.number().int().positive().nullish(),
  socialLinks: z.array(socialLinkSchema).max(20).optional(),
});

/** Creating a profile also requires the anchor wallet address. */
export const profileCreateSchema = profileWritableSchema.extend({
  walletAddress: walletSchema,
});

export type ProfileWritable = z.infer<typeof profileWritableSchema>;
export type ProfileCreate = z.infer<typeof profileCreateSchema>;
