<template>
  <div class="parent">
    <div class="statusline">
      <select v-model="selectedModel" class="model-picker">
        <option value="" disabled>Select a model...</option>
        <option v-for="model in models" :key="model" :value="model">
          {{ model }}
        </option>
      </select>
    </div>
    <div class="div1" id="chat-box">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="msg"
        :class="msgClass(msg.sender)"
      >
        {{ msg.sender }}: {{ msg.text }}
      </div>
    </div>
    <div class="div2">
      <div class="input-row">
        <textarea
          v-model="input"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="Type a message..."
        ></textarea>
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const messages = ref([]);
const input = ref("");
const models = ref([]);
const selectedModel = ref("");

function msgClass(sender) {
  if (sender === "You") return "msg-user";
  if (sender === "AI") return "msg-ai";
  return "msg-error";
}

async function loadModels() {
  if (!window.api) return;
  try {
    const result = await window.api.getModels();
    if (result.ok) {
      models.value = result.models;
      if (result.models.length > 0) {
        selectedModel.value = result.models[0];
      }
    } else {
      console.error("Failed to load models:", result.error);
    }
  } catch (err) {
    console.error("Failed to load models:", err.message);
  }
}

async function applyColorScheme() {
  if (!window.api) {
    console.error("window.api is not available. Preload may have failed.");
    return;
  }

  try {
    const colors = await window.api.getColors();
    const root = document.documentElement;
    for (const [key, value] of Object.entries(colors)) {
      const cssKey = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(cssKey, value);
    }
    console.log("Color scheme applied:", Object.keys(colors).length, "colors");
  } catch (err) {
    console.error("Failed to apply color scheme:", err.message);
  }
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  messages.value.push({ sender: "You", text });
  input.value = "";

  try {
    const result = await window.api.chat(text);
    if (result.ok) {
      messages.value.push({ sender: "AI", text: result.reply });
    } else {
      messages.value.push({ sender: "Error", text: result.error });
    }
  } catch (err) {
    messages.value.push({ sender: "Error", text: err.message });
  }
}

onMounted(() => {
  applyColorScheme();
  loadModels();
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  background-color: var(--bg);
  color: var(--text);
  font-family: monospace;
}
</style>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.parent {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-template-rows: 24px repeat(4, 1fr) 1fr;
  gap: 8px;
  height: 100vh;
  padding: 8px;
  background-color: var(--bg);
  color: var(--text);
  font-family: monospace;
}

.statusline {
  grid-row-start: 1;
  border: 1px solid var(--border);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
}

.div1 {
  grid-row: span 4 / span 4;
  grid-row-start: 2;
  overflow-y: auto;
  border: 1px solid var(--border);
  background-color: var(--bg);
  padding: 8px;
}

.div2 {
  grid-row-start: 6;
  border: 1px solid var(--border);
  background-color: var(--bg-secondary);
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.model-picker {
  background-color: var(--bg-tertiary);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
  outline: none;
}

.model-picker:focus {
  border-color: var(--accent);
}

.input-row {
  display: flex;
  gap: 8px;
  flex: 1;
}

textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--border);
  outline: none;
  font-family: monospace;
  font-size: 14px;
  background-color: var(--bg);
  color: var(--text);
  padding: 4px;
}

textarea:focus {
  border-color: var(--accent);
}

button {
  padding: 8px 16px;
  align-self: stretch;
  cursor: pointer;
  background-color: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-family: monospace;
}

button:hover {
  background-color: var(--accent-hover);
}

.msg {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
}

.msg-user {
  background-color: var(--user-bubble-bg);
  color: var(--user-bubble-text);
}

.msg-ai {
  background-color: var(--ai-bubble-bg);
  color: var(--ai-bubble-text);
}

.msg-error {
  background-color: var(--danger);
  color: var(--bg);
}
</style>
