<template>
  <div class="parent">
    <StatusBar
      :models="models"
      v-model:selectedModel="selectedModel"
      :folderPath="folderPath"
      @selectFolder="selectFolder"
    />
    <FileBrowserPanel :folderPath="folderPath" />
    <ChatBox :messages="messages" />
    <MessageInput @send="sendMessage" />
  </div>
</template>

<script setup>

import {ref, onMounted, watch} from "vue";
import "./style.css";
import StatusBar from "./components/StatusBar.vue";
import ChatBox from "./components/ChatBox.vue";
import MessageInput from "./components/MessageInput.vue";
import FileBrowserPanel from "./components/FileBrowserPanel.vue";

const messages = ref([]);
const models = ref([]);
const folderPath = ref("");
const selectedModel = ref("");

//watch saved model
watch(selectedModel, (newModel) => {
  localStorage.setItem("selectedModel", newModel);
})

function loadSavedModel() {
 if (!window.api) return;
 //return selected model if there is
 selectedModel.value = localStorage.getItem("selectedModel") || "";
}

async function loadModels() {
  if (!window.api) return;
  try {
    const result = await window.api.getModels();
    if (result.ok) {
      models.value = result.models;
      if (result.models.length > 0 && !selectedModel.value) {
        //load the first model in the index if no model is saved
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

  let thinkingId = messages.value.length;
  messages.value.push({ sender: "Thinking", text: "Thinking", elapsed: 0, tokens: 0 });

  let stopThinkingListener = null;
  let stopToolListener = null;

  const handleThinking = (data) => {
    if (messages.value[thinkingId]?.sender !== "Thinking") return;
    messages.value[thinkingId] = {
      sender: "Thinking",
      text: data.text,
      elapsed: data.elapsed,
      tokens: data.tokens,
    };
  };

  const handleToolCall = (data) => {
    const existing = messages.value.findIndex(
      (m) => m.sender === "Tool" && m.tool === data.tool && JSON.stringify(m.args) === JSON.stringify(data.args)
    );
    if (existing >= 0) {
      messages.value[existing].status = data.status;
    } else {
      messages.value.splice(thinkingId, 0, {
        sender: "Tool",
        tool: data.tool,
        args: data.args,
        status: data.status,
      });
      thinkingId++;
    }
  };

  if (window.api.onThinking) {
    stopThinkingListener = window.api.onThinking(handleThinking);
  }
  if (window.api.onToolCall) {
    stopToolListener = window.api.onToolCall(handleToolCall);
  }

  try {
    const result = await window.api.chat(text,
    selectedModel.value,
    folderPath.value);
    if (result.ok) {
      messages.value[thinkingId] = { sender: "AI", text: result.reply };
    } else {
      messages.value[thinkingId] = { sender: "Error", text: result.error };
    }
  } catch (err) {
    messages.value[thinkingId] = { sender: "Error", text: err.message };
  } finally {
    if (stopThinkingListener) stopThinkingListener();
    if (stopToolListener) stopToolListener();
  }
}


async function selectFolder() {
  if (!window.api) return;
  const result = await window.api.selectFolder();
  if (result.ok) {
    folderPath.value = result.path;
  } else {
    console.error("Folder selection failed:", result.error);
  }
}

onMounted(() => {
//check saved models muna 
  loadSavedModel();
// then load model
loadModels();
});
</script>
