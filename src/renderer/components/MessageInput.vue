<template>
  <div class="div2">
    <div class="input-row">
      <textarea
        v-model="text"
        @keydown.enter.exact.prevent="send"
        placeholder="Type a message..."
      ></textarea>
      <!-- // press to send the message -->
      <button @click="send">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["send"]);

const text = ref("");

function send() {
  const value = text.value.trim();
  if (!value) return;
  emit("send", value);
  text.value = "";
}
</script>
