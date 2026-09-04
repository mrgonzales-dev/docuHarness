const axios = require("axios");
const { loadConfig } = require("../config.js");

/**
 * Streaming chat completion.
 *
 * Calls onProgress({ content, toolCalls, usage }) as chunks arrive
 * so the caller can update the UI in real time.
 */
async function chat(messages, model, options = {}, onProgress, signal) {
  const { host, apiKey } = loadConfig();

  const body = {
    model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
  };

  if (options.tools) {
    body.tools = options.tools;
  }

  const response = await axios.post(`${host}/chat/completions`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    responseType: "stream",
    signal,
  });

  let content = "";
  let usage = null;
  const toolCallMap = new Map();

  const lineBuffer = { data: "" };

  await new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      response.data.destroy();
      reject(new Error("Aborted"));
      return;
    }

    if (signal) {
      signal.addEventListener("abort", () => {
        response.data.destroy();
        reject(new Error("Aborted"));
      });
    }

    response.data.on("data", (chunk) => {
      lineBuffer.data += chunk.toString();
      const lines = lineBuffer.data.split("\n");
      lineBuffer.data = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (jsonStr === "[DONE]") continue;

        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          continue;
        }

        if (parsed.usage) {
          usage = parsed.usage;
        }

        const delta = parsed.choices?.[0]?.delta;

        if (delta) {
          if (delta.content) {
            content += delta.content;
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCallMap.has(idx)) {
                toolCallMap.set(idx, {
                  id: tc.id || "",
                  function: { name: "", arguments: "" },
                });
              }
              const entry = toolCallMap.get(idx);
              if (tc.id) entry.id = tc.id;
              if (tc.function?.name) entry.function.name += tc.function.name;
              if (tc.function?.arguments) entry.function.arguments += tc.function.arguments;
            }
          }
        }

        if (onProgress) {
          onProgress({
            content,
            toolCalls: Array.from(toolCallMap.values()),
            usage,
          });
        }
      }
    });

    response.data.on("end", resolve);
    response.data.on("error", reject);
  });

  const toolCalls = Array.from(toolCallMap.values()).filter(
    (tc) => tc.function.name
  );

  return { content, toolCalls, usage };
}

module.exports = { chat };
