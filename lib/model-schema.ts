import { z } from "zod";
import type { InputType } from "./types";

// ---- Zod schema (server-side validation) ----
export const InputTypeZ = z.enum([
  "singleSelect",
  "multiSelect",
  "slider",
  "upload",
  "yesNo",
  "text",
]);

export const FollowupZ = z
  .object({
    show_if: z.record(z.unknown()),
    ask: z.string().min(1),
    input_type: InputTypeZ,
    choices: z.array(z.string()).min(1).optional(),
  })
  .strict();

export const IntakeTurnZ = z
  .object({
    next_question: z.string().min(1),
    input_type: InputTypeZ,
    choices: z.array(z.string()).min(1).optional(),
    explain_why: z.string().optional(),
    state_updates: z.record(z.unknown()).optional(),
    followups: z.array(FollowupZ).optional(),
    validation: z
      .object({
        required: z.boolean().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export type IntakeTurnT = z.infer<typeof IntakeTurnZ>;

// ---- Manual JSON Schema (for OpenAI Structured Outputs) ----
export const IntakeTurnJSONSchema = {
  name: "IntakeTurn",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      next_question: { type: "string" },
      input_type: {
        type: "string",
        enum: ["singleSelect", "multiSelect", "slider", "upload", "yesNo", "text"],
      },
      choices: { type: "array", items: { type: "string" } },
      explain_why: { type: "string" },
      state_updates: { type: "object", additionalProperties: true },
      followups: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            show_if: { type: "object", additionalProperties: true },
            ask: { type: "string" },
            input_type: {
              type: "string",
              enum: ["singleSelect", "multiSelect", "slider", "upload", "yesNo", "text"],
            },
            choices: { type: "array", items: { type: "string" } },
          },
          required: ["show_if", "ask", "input_type"],
        },
      },
      validation: {
        type: "object",
        additionalProperties: false,
        properties: {
          required: { type: "boolean" },
          min: { type: "number" },
          max: { type: "number" },
          pattern: { type: "string" },
        },
      },
    },
    required: ["next_question", "input_type"],
  },
  strict: true,
} as const;
