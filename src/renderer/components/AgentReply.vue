<template>
  <div class="msg-ai">
    <span class="msg-ai-bullet">●</span>
    <div class="msg-ai-content markdown-body" v-html="rendered"></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import "github-markdown-css/github-markdown.css";

const md = new MarkdownIt();

const props = defineProps({
  text: { type: String, required: true },
});

const rendered = computed(() => md.render(props.text));
</script>
