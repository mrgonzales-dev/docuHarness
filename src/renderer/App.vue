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
import "./style.css";

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
