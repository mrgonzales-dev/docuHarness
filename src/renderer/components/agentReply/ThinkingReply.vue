<template>
  <div class="agent-thinking-reply">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
});
</script>

<style scoped>
.agent-thinking-reply {
  /* Customize thinking reply style here */
}
</style>
