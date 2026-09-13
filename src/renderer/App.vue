<template>
  <div class="app-shell">
    <TitleBar />
    <div class="parent">
      <FileBrowserPanel :folderPath="folderPath" @selectFolder="selectFolder" />
      <AgentInstanceCard
        :models="models"
        :folderPath="folderPath"
      />
    </div>
  </div>
</template>

<script setup>

import {ref, onMounted} from "vue";
import "./style.css";
import FileBrowserPanel from "./components/FileBrowserPanel.vue";
import TitleBar from "./components/TitleBar.vue";
import AgentInstanceCard from "./components/AgentInstance/AgentInstanceCard.vue";

const models = ref([]);
const folderPath = ref("");

async function loadModels() {
  if (!window.api) return;
  try {
    const result = await window.api.getModels();
    if (result.ok) {
      models.value = result.models;
    } else {
      console.error("Failed to load models:", result.error);
    }
  } catch (err) {
    console.error("Failed to load models:", err.message);
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
  loadModels();
});
</script>
