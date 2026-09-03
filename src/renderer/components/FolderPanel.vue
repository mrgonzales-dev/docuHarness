<template>
  <div class="side-panel">
    <div class="panel-tabs">
      <div class="panel-tab active">Browser</div>
    </div>
    <div class="panel-content">
      <div v-if="!folderPath" class="side-panel-empty">
        No folder selected
      </div>
      <div v-else-if="loading" class="side-panel-empty">
        Loading...
      </div>
      <div v-else-if="error" class="side-panel-empty">
        {{ error }}
      </div>
      <div v-else class="folder-entries">
        <div
          v-for="entry in entries"
          :key="entry.name"
          class="folder-entry"
          :class="{ selected: entry.name === selectedFile }"
          @click="selectedFile = entry.name"
        >
          <span v-if="entry.isDirectory" class="entry-icon" v-html="folderClosedIcon"></span>
          <span v-else class="entry-icon" v-html="folderOpenIcon"></span>
          <span class="entry-name">{{ entry.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import folderOpenIcon from "../../icons/folder-open-icon.svg?raw";
import folderClosedIcon from "../../icons/folder-open-closed.svg?raw";

const props = defineProps({
  folderPath: { type: String, default: "" },
});

const entries = ref([]);
const loading = ref(false);
const error = ref("");
const selectedFile = ref("");

async function loadContents() {
  if (!props.folderPath) {
    entries.value = [];
    return;
  }
  loading.value = true;
  error.value = "";
  selectedFile.value = "";
  try {
    const result = await window.api.readFolderContents(props.folderPath);
    if (result.ok) {
      entries.value = result.entries;
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = err.message;
  }
  loading.value = false;
}

watch(() => props.folderPath, loadContents, { immediate: true });
</script>
