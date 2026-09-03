<template>
  <div class="agent-tool-reply">
    <span class="tool-marker" :class="status">●</span>
    <span class="tool-name">Read</span>
    <span class="tool-arg">{{ args.filePath }}</span>
  </div>
</template>

<script setup>
defineProps({
  args: { type: Object, required: true },
  status: { type: String, default: "running" },
});
</script>

<style scoped>
.agent-tool-reply {
  color: var(--text-secondary);
  padding: 2px 8px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
}

.tool-marker {
  flex-shrink: 0;
}

.tool-marker.running {
  color: var(--accent);
  display: inline-block;
  animation: pulse 1s ease-in-out infinite;
}

.tool-marker.done {
  color: var(--success);
}

.tool-marker.error {
  color: var(--danger);
}

.tool-name {
  color: var(--accent-hover);
  font-weight: bold;
}

.tool-arg {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes pulse {
  0% { transform: scale(0.6); }
  50% { transform: scale(1.2); }
  100% { transform: scale(0.6); }
}
</style>
