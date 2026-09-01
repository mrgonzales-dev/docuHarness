<template>
  <div class="parent">
    <div class="statusline">
      <div class="model-dropdown">
        <div class="model-display" @click="toggleDropdown">
          {{ selectedModel || "Select a model..." }}
          <span class="chevron">{{ dropdownOpen ? "▲" : "▼" }}</span>
        </div>
        <div v-if="dropdownOpen" class="model-list">
          <input
            v-model="searchQuery"
            class="model-search"
            placeholder="Search models..."
            ref="searchInput"
            @keydown="onSearchKeydown"
          />
          <div class="model-options">
            <div
              v-for="(model, i) in filteredModels"
              :key="model"
              class="model-option"
              :class="{ active: model === selectedModel, highlighted: i === activeIndex }"
              @click="pickModel(model)"
              @mouseenter="activeIndex = i"
            >
              {{ model }}
            </div>
            <div v-if="filteredModels.length === 0" class="no-results">
              No models found
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted, nextTick } from "vue";

const messages = ref([]);
const input = ref("");
const models = ref([]);
const selectedModel = ref("");
const dropdownOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref(null);
const activeIndex = ref(0);

const filteredModels = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return models.value;
  return models.value.filter((m) =>
    m.toLowerCase().includes(query)
  );
});

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) {
    searchQuery.value = "";
    activeIndex.value = 0;
    nextTick(() => searchInput.value?.focus());
  }
}

function pickModel(model) {
  selectedModel.value = model;
  dropdownOpen.value = false;
  searchQuery.value = "";
}

function onSearchKeydown(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (activeIndex.value < filteredModels.value.length - 1) {
      activeIndex.value++;
      scrollActiveIntoView();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (activeIndex.value > 0) {
      activeIndex.value--;
      scrollActiveIntoView();
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (filteredModels.value.length > 0) {
      pickModel(filteredModels.value[activeIndex.value]);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    dropdownOpen.value = false;
    searchQuery.value = "";
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const options = document.querySelector(".model-options");
    const active = options?.children[activeIndex.value];
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  });
}

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

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border);
}

::-webkit-scrollbar-corner {
  background: var(--bg-secondary);
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

.model-dropdown {
  position: relative;
  max-width: 200px;
}

.model-display {
  background-color: var(--bg-tertiary);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.model-display:hover {
  border-color: var(--accent);
}

.chevron {
  font-size: 8px;
  flex-shrink: 0;
}

.model-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 240px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  z-index: 100;
  margin-top: 2px;
}

.model-search {
  width: 100%;
  background-color: var(--bg);
  color: var(--text);
  border: none;
  border-bottom: 1px solid var(--border);
  outline: none;
  font-family: monospace;
  font-size: 12px;
  padding: 6px 8px;
  box-sizing: border-box;
}

.model-search:focus {
  border-bottom-color: var(--accent);
}

.model-options {
  max-height: 200px;
  overflow-y: auto;
}

.model-option {
  padding: 4px 8px;
  font-size: 12px;
  font-family: monospace;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-option:hover {
  background-color: var(--bg-tertiary);
}

.model-option.active {
  background-color: var(--accent);
  color: var(--bg);
}

.model-option.highlighted {
  background-color: var(--bg-tertiary);
}

.model-option.active.highlighted {
  background-color: var(--accent);
  color: var(--bg);
}

.no-results {
  padding: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
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
