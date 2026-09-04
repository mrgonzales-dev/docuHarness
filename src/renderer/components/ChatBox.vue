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
    <div ref="chatScroll" class="chat-scroll" @scroll="handleScroll">
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
        <InvokeSkillReply
          v-else-if="msg.sender === 'Tool' && msg.tool === 'invokeSkill'"
          :args="msg.args"
          :status="msg.status"
        />
        <div v-else class="msg msg-error">
          {{ msg.sender }}: {{ msg.text }}
        </div>
      </template>
    </div>
    <QueueBar
      :queue="queue"
      :isResponding="isResponding"
      @sendQueue="$emit('sendQueue')"
      @interrupt="$emit('interrupt')"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import UserMessage from "./UserMessage.vue";
import AgentReply from "./AgentReply.vue";
import ThinkingReply from "./agentReply/ThinkingReply.vue";
import ReadingFileReply from "./agentReply/ReadingFileReply.vue";
import SearchingFileReply from "./agentReply/SearchingFileReply.vue";
import GrepReply from "./agentReply/GrepReply.vue";
import InvokeSkillReply from "./agentReply/InvokeSkillReply.vue";
import QueueBar from "./QueueBar.vue";

const props = defineProps({
  messages: { type: Array, default: () => [] },
  queue: { type: Array, default: () => [] },
  isResponding: { type: Boolean, default: false },
});

defineEmits(["sendQueue", "interrupt"]);

const chatScroll = ref(null);
const isAtBottom = ref(true);

function isScrolledToBottom() {
  const el = chatScroll.value;
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 30;
}

function handleScroll() {
  isAtBottom.value = isScrolledToBottom();
}

function scrollToBottom() {
  const el = chatScroll.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

watch(
  () => props.messages.length,
  () => {
    if (isAtBottom.value) {
      nextTick(scrollToBottom);
    }
  }
);

watch(
  () => props.messages,
  () => {
    if (isAtBottom.value) {
      nextTick(scrollToBottom);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.div1 {
  display: flex;
  flex-direction: column;
}

.chat-scroll {
  flex: 1;
  overflow-y: auto;
}
</style>
