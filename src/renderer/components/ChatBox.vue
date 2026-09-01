<template>
  <div class="div1" id="chat-box">
    <div
      v-for="(msg, i) in messages"
      :key="i"
      class="msg"
      :class="msgClass(msg.sender)"
    >
      {{ msg.sender }}: {{ msg.text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: { type: Array, default: () => [] },
});

function msgClass(sender) {
  if (sender === "You") return "msg-user";
  if (sender === "AI") return "msg-ai";
  return "msg-error";
}
</script>
