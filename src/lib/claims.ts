// Deck-claim schema + invariants (VC-BRAIN-PLAN.md §7 M2, R contradiction wow moment).
// A claim ties a pitch-deck assertion to its verification status against real
// evidence (deck slide + founder repo). Exactly one claim is "contradicted".
import { z } from "zod";

export const claimStatus = z.enum(["verified", "unsupported", "contradicted"]);
export type ClaimStatus = z.infer<typeof claimStatus>;

export const evidenceRefSchema = z.object({
  locator: z.string().min(1), // deck://.../slide/N | path:lines | url
  excerpt: z.string().min(1),
});
export type EvidenceRef = z.infer<typeof evidenceRefSchema>;

export const claimSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  slideNo: z.number().int().positive(),
  status: claimStatus,
  evidence: z.array(evidenceRefSchema).min(1),
});
export type Claim = z.infer<typeof claimSchema>;

export const claimsSchema = z.array(claimSchema).min(1);
export type Claims = z.infer<typeof claimsSchema>;

export function contradictedCount(claims: Claims): number {
  return claims.filter((c) => c.status === "contradicted").length;
}

export function parseClaims(data: unknown): Claims {
  return claimsSchema.parse(data);
}

export function safeParseClaims(data: unknown) {
  return claimsSchema.safeParse(data);
}
