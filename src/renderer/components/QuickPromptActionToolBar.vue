<!--
  QuickPromptActionToolBar.vue
  A toolbar bar that sits on top of the message input.

  This will act as quick shortcut keys with buttons that when clicked
  will automatically send manufactured instructions to the agent.

  Props:
    - (none yet)

  Emits:
    - (none yet)
-->
<template>
  <div class="quick-action-bar"></div>
</template>

<script setup>
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
</style>
