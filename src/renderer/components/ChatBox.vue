<template>
  <div class="div1" id="chat-box">
    <template v-for="(msg, i) in messages" :key="i">
      <UserMessage v-if="msg.sender === 'You'" :text="msg.text" />
      <AgentReply v-else-if="msg.sender === 'AI'" :text="msg.text" />
      <ThinkingReply
        v-else-if="msg.sender === 'Thinking'"
        :text="msg.text"
        :elapsed="msg.elapsed"
        :tokens="msg.tokens"
      />
      <div v-else class="msg msg-error">
        {{ msg.sender }}: {{ msg.text }}
      </div>
    </template>
  </div>
</template>

<script setup>
import UserMessage from "./UserMessage.vue";
import AgentReply from "./AgentReply.vue";
import ThinkingReply from "./agentReply/ThinkingReply.vue";

defineProps({
  messages: { type: Array, default: () => [] },
});
</script>
