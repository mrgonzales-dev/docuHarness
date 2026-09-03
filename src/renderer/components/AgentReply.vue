<template>
  <div class="msg-ai">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
});
</script>
