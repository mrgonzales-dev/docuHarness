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

import {ref, onMounted, watch} from "vue";
import "./style.css";
import StatusBar from "./components/StatusBar.vue";
import ChatBox from "./components/ChatBox.vue";
import MessageInput from "./components/MessageInput.vue";


const messages = ref([]);
const models = ref([]);
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
//check saved models muna 
  loadSavedModel();
// then load model
loadModels();
});
</script>
