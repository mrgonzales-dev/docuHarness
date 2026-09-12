<!--
  QuickPromptActionToolBar.vue
  A toolbar that sits above the message input.

  Renders saved quick prompt buttons. Clicking a button sends the
  prompt text to the agent. The + button opens a modal to add a
  new quick prompt. Prompts persist to localStorage.

  Props:
    - (none)

  Emits:
    - send(text)  Send a prompt to the agent.
-->
<template>
  <div class="quick-action-bar">
    <button
      v-for="prompt in prompts"
      :key="prompt.id"
      class="quick-btn"
      @click="$emit('send', prompt.text)"
      :title="prompt.text"
    >{{ prompt.name }}</button>
    <button class="quick-btn quick-btn-add" @click="openModal">+</button>
    <QuickPromptModal
      :open="modalOpen"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import QuickPromptModal from "./QuickPromptModal.vue";
import { loadPrompts, addPrompt, createPrompt } from "../partials/quickPrompts";

defineEmits(["send"]);

const prompts = ref([]);
const modalOpen = ref(false);

onMounted(() => {
  prompts.value = loadPrompts();
});

function openModal() {
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

function handleSave({ name, text }) {
  const prompt = createPrompt(name, text);
  prompts.value = addPrompt(prompts.value, prompt);
  closeModal();
}
</script>

<style scoped>
.quick-action-bar {
  grid-column: 2;
  border: 1px solid var(--border);
  background-color: var(--bg-secondary);
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
  flex-shrink: 0;
}

.quick-btn {
  padding: 2px 8px;
  font-size: 11px;
  font-family: inherit;
  background-color: var(--bg-tertiary);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.quick-btn:hover {
  border-color: var(--accent);
}

.quick-btn-add {
  background-color: var(--bg);
  color: var(--text-secondary);
  font-weight: bold;
  padding: 2px 8px;
}

.quick-btn-add:hover {
  color: var(--text);
}
</style>
