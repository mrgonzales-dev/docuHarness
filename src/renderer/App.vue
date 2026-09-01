<template>
  <div class="parent">
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

function msgClass(sender) {
  if (sender === "You") return "msg-user";
  if (sender === "AI") return "msg-ai";
  return "msg-error";
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
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
  height: 100vh;
  padding: 8px;
  background-color: var(--bg);
  color: var(--text);
  font-family: monospace;
}

.div1 {
  grid-row: span 4 / span 4;
  overflow-y: auto;
  border: 1px solid var(--border);
  background-color: var(--bg);
  padding: 8px;
}

.div2 {
  grid-row-start: 5;
  border: 1px solid var(--border);
  background-color: var(--bg-secondary);
  padding: 8px;
  display: flex;
  flex-direction: column;
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
