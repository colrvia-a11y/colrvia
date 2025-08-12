import { z } from "zod";

export const InputTypeZ = z.enum([
  "singleSelect","multiSelect","slider","upload","yesNo","text",
]);

const ShowIfCondZ = z.object({
  field: z.string().min(1),
  op: z.enum(["==","!=",">=", "<=", ">", "<", "truthy", "falsy"]),
  value: z.unknown().optional(),
}).strict();

const FollowupZ = z.object({
  field_id: z.string().min(1),
  ask: z.string().min(1),
  input_type: InputTypeZ,
  choices: z.array(z.string()).min(1).optional(),
  conditions: z.array(ShowIfCondZ).default([]),
}).strict();

export const IntakeTurnZ = z.object({
  field_id: z.string().min(1),
  next_question: z.string().min(1),
  input_type: InputTypeZ,
  choices: z.array(z.string()).min(1).optional(),
  explain_why: z.string().optional(),
  followups: z.array(FollowupZ).optional(),
  validation: z
    .object({
      required: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .strict()
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
      choices: { type: "array", items: { type: "string" } },
      explain_why: { type: "string" },
      followups: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            field_id: { type: "string" },
            ask: { type: "string" },
            input_type: { type: "string", enum: ["singleSelect","multiSelect","slider","upload","yesNo","text"] },
            choices: { type: "array", items: { type: "string" } },
            conditions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  field: { type: "string" },
                  op: { type: "string", enum: ["==","!=",">=","<=",">","<","truthy","falsy"] },
                  value: {
                    oneOf: [
                      { type: "string" },
                      { type: "number" },
                      { type: "integer" },
                      { type: "boolean" },
                      { type: "null" },
                      { type: "array", items: {} },
                      { type: "object", additionalProperties: false }
                    ]
                  }
                },
                required: ["field","op"]
              }
            }
          },
          required: ["field_id","ask","input_type","conditions"]
        }
      },
      validation: {
        type: "object",
        additionalProperties: false,
        properties: {
          required: { type: "boolean" },
          min: { type: "number" },
          max: { type: "number" },
          pattern: { type: "string" },
        }
      }
    },
    required: ["field_id","next_question","input_type"]
  },
  strict: true,
} as const;
