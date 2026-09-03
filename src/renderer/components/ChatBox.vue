<!--
  ChatBox.vue
  Renders the message list. Loops over the messages array and picks
  the correct component for each message based on the `sender` field.

  Props:
    - messages: Array of message objects. Each object has a `sender`
      field that decides which component renders it.

  Sender to component mapping:
    - "You"                          → UserMessage
    - "AI"                           → AgentReply
    - "Thinking"                     → ThinkingReply
    - "Tool" + tool: "readFile"      → ReadingFileReply
    - "Tool" + tool: "fileSearch"    → SearchingFileReply
    - "Tool" + tool: "fileGrep"      → GrepReply
    - anything else                  → fallback error div
-->
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
      <ReadingFileReply
        v-else-if="msg.sender === 'Tool' && msg.tool === 'readFile'"
        :args="msg.args"
        :status="msg.status"
      />
      <SearchingFileReply
        v-else-if="msg.sender === 'Tool' && msg.tool === 'fileSearch'"
        :args="msg.args"
        :status="msg.status"
      />
      <GrepReply
        v-else-if="msg.sender === 'Tool' && msg.tool === 'fileGrep'"
        :args="msg.args"
        :status="msg.status"
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
import ReadingFileReply from "./agentReply/ReadingFileReply.vue";
import SearchingFileReply from "./agentReply/SearchingFileReply.vue";
import GrepReply from "./agentReply/GrepReply.vue";

defineProps({
  messages: { type: Array, default: () => [] },
});
</script>
