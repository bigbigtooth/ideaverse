<!--
  @fileoverview Markdown viewer component
  @module components/common/MarkdownViewer
  @description Renders Markdown content as HTML using the marked library.
  Supports GFM (GitHub Flavored Markdown) with custom styling
  for consistent appearance across the application.
  
  @copyright 2026 BigTooth
  @license GPL-3.0
-->

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: { type: String, default: '' }
})

marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  return marked(props.content)
})
</script>

<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<style scoped>
.markdown-content {
  line-height: 1.8;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  color: var(--color-text-primary);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-md);
  font-weight: 600;
}

.markdown-content :deep(h1) { font-size: var(--text-2xl); }
.markdown-content :deep(h2) { font-size: var(--text-xl); }
.markdown-content :deep(h3) { font-size: var(--text-lg); }
.markdown-content :deep(h4) { font-size: var(--text-base); }

.markdown-content :deep(p) {
  margin-bottom: var(--space-md);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: var(--space-xl);
  margin-bottom: var(--space-md);
}

.markdown-content :deep(li) {
  margin-bottom: var(--space-xs);
}

.markdown-content :deep(strong) {
  color: var(--color-text-primary);
  font-weight: 600;
}

.markdown-content :deep(code) {
  background: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: var(--color-bg-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin-bottom: var(--space-md);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent-primary);
  padding-left: var(--space-md);
  margin: var(--space-md) 0;
  color: var(--color-text-muted);
  font-style: italic;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-lg) 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-md);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--color-border);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--color-bg-tertiary);
  font-weight: 600;
}
</style>
