import { loadConfig, getModels } from "../src/config";
import { chat } from "../src/ai-bridge";

describe("Agent startup", () => {
  test("loads API key and host from config file", () => {
    const config = loadConfig();

    expect(config.host).toBeDefined();
    expect(config.host).toBe("http://127.0.0.1:20128/v1");
    expect(config.apiKey).toBeDefined();
    expect(typeof config.apiKey).toBe("string");
  });

  test("fetches available models from API", async () => {
    const models = await getModels();

    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
  });

  test("agent replies to hello", async () => {
    const messages = [
      { role: "user", content: "Hello" },
    ];
    const reply = await chat(messages, "wbridge/glm-5.2");
    console.log("Raw reply:", reply);
    console.log("Agent reply:", reply.content);
    console.log("Token usage:", reply.usage);
    expect(typeof reply.content).toBe("string");
    expect(reply.content.length).toBeGreaterThan(0);
    expect(reply.usage).toBeDefined();
    expect(reply.usage.total_tokens).toBeGreaterThan(0);
  }, 30000);
});
