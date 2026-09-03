<template>
  <div class="div1" id="chat-box">
    <template v-for="(msg, i) in messages" :key="i">
      <UserMessage v-if="msg.sender === 'You'" :text="msg.text" />
      <AgentReply v-else-if="msg.sender === 'AI'" :text="msg.text" />
      <div v-else class="msg msg-error">
        {{ msg.sender }}: {{ msg.text }}
      </div>
    </template>
  </div>
</template>

<script setup>
import UserMessage from "./UserMessage.vue";
import AgentReply from "./AgentReply.vue";

defineProps({
  messages: { type: Array, default: () => [] },
});
</script>
