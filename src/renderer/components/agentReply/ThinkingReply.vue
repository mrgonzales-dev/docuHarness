<template>
  <div class="agent-thinking-reply">
    <span class="thinking-spinner"></span>
    <span class="thinking-text">{{ text }}…</span>
    <span class="thinking-meta">
      (↓ · {{ localElapsed }}s · {{ formatTokens(tokens) }} · thinking with high effort)
    </span>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  elapsed: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
});

const localElapsed = ref(props.elapsed);
let timer = null;

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    localElapsed.value++;
  }, 1000);
}

startTimer();

watch(() => props.elapsed, (newVal) => {
  if (newVal > localElapsed.value) {
    localElapsed.value = newVal;
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function formatTokens(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k tokens";
  return n + " tokens";
}
</script>

<style scoped>
.agent-thinking-reply {
  color: var(--text-secondary);
  font-style: italic;
  padding: 4px 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.thinking-spinner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent);
  flex-shrink: 0;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

.thinking-text {
  white-space: pre-wrap;
}

.thinking-meta {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.85em;
  white-space: nowrap;
}
</style>
