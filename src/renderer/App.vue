<template>
  <div class="parent">
    <StatusBar
      :models="models"
      v-model:selectedModel="selectedModel"
    />
    <ChatBox :messages="messages" />
    <MessageInput @send="sendMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import "./style.css";
import StatusBar from "./components/StatusBar.vue";
import ChatBox from "./components/ChatBox.vue";
import MessageInput from "./components/MessageInput.vue";

const messages = ref([]);
const models = ref([]);
const selectedModel = ref("");

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

async function sendMessage(text) {
  messages.value.push({ sender: "You", text });

  try {
    const result = await window.api.chat(text, selectedModel.value);
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
  loadModels();
});
</script>
