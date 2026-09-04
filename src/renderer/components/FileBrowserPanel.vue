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
        <FileBrowserEntry
          v-for="entry in entries"
          :key="entry.name"
          :entry="entry"
          :depth="0"
          :basePath="folderPath"
          :selectedFile="selectedFile"
          @select="selectedFile = $event"
          @toggle="toggleEntry"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import FileBrowserEntry from "./FileBrowserEntry.vue";

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
      entries.value = result.entries.map((e) => ({
        name: e.name,
        isDirectory: e.isDirectory,
        expanded: false,
        children: [],
        loaded: false,
      }));
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = err.message;
  }
  loading.value = false;
}

async function toggleEntry({ entry, path }) {
  entry.expanded = !entry.expanded;

  if (entry.expanded && !entry.loaded) {
    try {
      const result = await window.api.readFolderContents(path);
      if (result.ok) {
        entry.children = result.entries.map((e) => ({
          name: e.name,
          isDirectory: e.isDirectory,
          expanded: false,
          children: [],
          loaded: false,
        }));
        entry.loaded = true;
      }
    } catch {
      entry.children = [];
    }
  }
}

watch(() => props.folderPath, loadContents, { immediate: true });
</script>

<style scoped>
.side-panel {
  grid-row: 1 / -1;
  grid-column: 1;
  border: 1px solid var(--border);
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.panel-tab {
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}

.panel-tab.active {
  color: var(--text);
}

.panel-content {
  overflow-y: auto;
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.side-panel-empty {
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
  padding: 16px 4px;
  margin-top: auto;
  margin-bottom: auto;
}

.folder-entries {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
