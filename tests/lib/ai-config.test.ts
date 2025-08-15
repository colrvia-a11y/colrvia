// tests/lib/ai-config.test.ts
import { describe, it, expect } from "vitest";

describe("MODELS defaults", async () => {
  it("uses defaults when envs are missing", async () => {
    const old = { ...process.env };
    delete process.env.VIA_CHAT_MODEL;
    delete process.env.VIA_CHAT_FAST_MODEL;
    const { MODELS } = await import("@/lib/ai/config");
    expect(MODELS.CHAT).toBe("gpt-5");
    expect(MODELS.CHAT_FAST).toBe("gpt-5-mini");
    process.env = old;
  });
});
