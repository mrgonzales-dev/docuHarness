<template>
  <div class="agent-reading-reply">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
});
</script>

<style scoped>
.agent-reading-reply {
  /* Customize reading reply style here */
}
</style>
