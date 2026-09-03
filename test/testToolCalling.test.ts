import { handler as chatHandler, clearHistory } from "../src/inter-process-communication/chat";
import * as fs from "fs";
import * as path from "path";

describe("AI tool calling end-to-end", () => {
  const tmpDir = path.join(__dirname, "tmp-toolcall");
  const tmpFile = path.join(tmpDir, "doc.txt");

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    fs.writeFileSync(tmpFile, "The sky is blue and the grass is green.");
    console.log("[setup] Created test file:", tmpFile);
  });

  afterAll(() => {
    fs.unlinkSync(tmpFile);
    fs.rmSync(tmpDir, { recursive: true });
    console.log("[teardown] Removed test file and tmp dir");
  });

  beforeEach(() => {
    clearHistory();
  });

  test("AI calls readFile tool and uses the result", async () => {
    const result = await chatHandler(
      {},
      { message: `Read the file at ${tmpFile} and tell me what it says.`, model: "wbridge/glm-5.2" }
    );

    console.log("[test] Reply:", result.reply);
    console.log("[test] OK:", result.ok);
    console.log("[test] Error:", result.error);
    console.log("[test] Usage:", JSON.stringify(result.usage, null, 2));

    expect(result.ok).toBe(true);
    expect(result.reply).toBeDefined();
    expect(result.reply.toLowerCase()).toContain("blue");
  }, 60000);
});
