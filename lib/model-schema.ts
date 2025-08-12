import { z } from "zod";

export const InputTypeZ = z.enum([
  "singleSelect","multiSelect","slider","upload","yesNo","text",
]);

const ShowIfCondZ = z.object({
  field: z.string().min(1),
  op: z.enum(["==","!=",">=", "<=", ">", "<", "truthy", "falsy"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
}).strict();

const FollowupZ = z.object({
  field_id: z.string().min(1),
  ask: z.string().min(1),
  input_type: InputTypeZ,
  choices: z.array(z.string()).min(1).nullable().optional(),
  conditions: z.array(ShowIfCondZ).default([]),
}).strict();

export const IntakeTurnZ = z.object({
  field_id: z.string().min(1),
  next_question: z.string().min(1),
  input_type: InputTypeZ,
  choices: z.array(z.string()).min(1).nullable().optional(),
  explain_why: z.string().nullable().optional(),
  followups: z.array(FollowupZ).nullable().optional(),
  validation: z
    .object({
      required: z.boolean().nullable().optional(),
      min: z.number().nullable().optional(),
      max: z.number().nullable().optional(),
      pattern: z.string().nullable().optional(),
    })
    .strict()
    .nullable()
    .optional(),
}).strict();

export type IntakeTurnT = z.infer<typeof IntakeTurnZ>;

// JSON Schema (Responses API requires additionalProperties:false everywhere)
export const IntakeTurnJSONSchema = {
  name: "IntakeTurn",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      field_id: { type: "string" },
      next_question: { type: "string" },
      input_type: { type: "string", enum: ["singleSelect","multiSelect","slider","upload","yesNo","text"] },
      choices: { type: ["array","null"], items: { type: "string" } },
      explain_why: { type: ["string","null"] },
      followups: {
        type: ["array","null"],
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            field_id: { type: "string" },
            ask: { type: "string" },
            input_type: { type: "string", enum: ["singleSelect","multiSelect","slider","upload","yesNo","text"] },
            choices: { type: ["array","null"], items: { type: "string" } },
            conditions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  field: { type: "string" },
                  op: { type: "string", enum: ["==","!=",">=","<=",">","<","truthy","falsy"] },
                  value: {
                    type: ["string","number","boolean","null"]
                  }
                },
                required: ["field","op","value"]
              }
            }
          },
          required: ["field_id","ask","input_type","choices","conditions"]
        }
      },
      validation: {
        type: ["object","null"],
        additionalProperties: false,
        properties: {
          required: { type: ["boolean","null"] },
          min: { type: ["number","null"] },
          max: { type: ["number","null"] },
          pattern: { type: ["string","null"] },
        },
        required: ["required","min","max","pattern"]
      }
    },
    required: ["field_id","next_question","input_type","choices","explain_why","followups","validation"]
  },
  strict: true,
} as const;
