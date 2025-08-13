// types/api.ts
import type { PaletteArray } from "@/types/palette"

export type ApiIssue = { path: string; message: string }
export type ApiError = { error: string; issues?: ApiIssue[] }

// /api/stories POST
export type StoryPayload = {
  id: string | null;
  title: string;
  palette: { hex: string; name: string; brand: string; placement: string }[];
  narrative: string;
  createdAt: string;
};
export type StoriesPostOk = { id: string } | { story: StoryPayload };
export type StoriesPostRes = StoriesPostOk | ApiError

// /api/stories/[id]/variant POST
export type VariantPostOk = { variant: PaletteArray }
export type VariantPostRes = VariantPostOk | ApiError
