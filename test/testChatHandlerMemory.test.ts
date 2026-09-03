import { handler as chatHandler, clearHistory } from "../src/inter-process-communication/chat";

describe("Chat handler memory", () => {
  beforeEach(() => {
    clearHistory();
  });

  test("handler stores conversation history across calls", async () => {
    // First call: user says something
    const result1 = await chatHandler({}, { message: "Remember the name: Rust", model: "wbridge/glm-5.2" });
    console.log("[test] Call 1 reply:", result1.reply);
    expect(result1.ok).toBe(true);

    // Second call: user asks to recall
    const result2 = await chatHandler({}, { message: "What name did I tell you?", model: "wbridge/glm-5.2" });
    console.log("[test] Call 2 reply:", result2.reply);
    console.log("[test] Call 2 usage:", JSON.stringify(result2.usage, null, 2));

    expect(result2.ok).toBe(true);
    expect(result2.reply.toLowerCase()).toContain("rust");
  }, 60000);

  test("clearHistory resets conversation", async () => {
    // Store a name
    await chatHandler({}, { message: "Remember the name: Python", model: "wbridge/glm-5.2" });

    // Clear history
    clearHistory();

    // AI should not remember the name
    const result = await chatHandler({}, { message: "What name did I tell you?", model: "wbridge/glm-5.2" });
    console.log("[test] After clear, reply:", result.reply);

    expect(result.ok).toBe(true);
    expect(result.reply.toLowerCase()).not.toContain("python");
  }, 60000);
});
