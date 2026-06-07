<template>
  <div class="visual-edit-panel">
    <div class="panel-header">
      <div>
        <div class="panel-title">可视化补丁</div>
        <div class="panel-subtitle">{{ elementLabel }}</div>
      </div>
      <a-button size="small" type="text" @click="$emit('close')">关闭</a-button>
    </div>

    <a-form layout="vertical" class="patch-form">
      <a-form-item label="文本内容">
        <a-input v-model:value="draft.textContent" :placeholder="element.textContent || '请输入新文本'" />
      </a-form-item>
      <a-form-item label="类名">
        <a-input v-model:value="draft.className" :placeholder="element.className || '请输入 class 类名'" />
      </a-form-item>
      <div class="style-grid">
        <a-form-item label="文字颜色">
          <a-input v-model:value="draft.color" placeholder="#1677ff" />
        </a-form-item>
        <a-form-item label="背景色">
          <a-input v-model:value="draft.backgroundColor" placeholder="#ffffff" />
        </a-form-item>
        <a-form-item label="字号">
          <a-input v-model:value="draft.fontSize" placeholder="16px" />
        </a-form-item>
        <a-form-item label="圆角">
          <a-input v-model:value="draft.borderRadius" placeholder="8px" />
        </a-form-item>
      </div>
      <a-form-item label="修改说明">
        <a-textarea v-model:value="draft.instruction" :rows="2" placeholder="可选：描述这次修改目的" />
      </a-form-item>
    </a-form>

    <div class="panel-actions">
      <a-button size="small" :loading="previewing" @click="handlePreview">预览差异</a-button>
      <a-button
        size="small"
        type="primary"
        :disabled="!patch?.applicable"
        :loading="applying"
        @click="handleApply"
      >
        应用补丁
      </a-button>
    </div>

    <a-alert
      v-if="patch?.message"
      class="patch-message"
      :type="patch.applicable ? 'info' : 'warning'"
      :message="patch.message"
      show-icon
    />

    <div v-if="patch?.candidates?.length" class="candidate-list">
      <div class="candidate-title">候选源码位置</div>
      <div v-for="candidate in patch.candidates.slice(0, 3)" :key="candidate.filePath" class="candidate-item">
        <span>{{ candidate.filePath }}:{{ candidate.startLine }}</span>
        <a-tag size="small">{{ candidate.score }}</a-tag>
      </div>
    </div>

    <pre v-if="patch?.unifiedDiff" class="diff-preview">{{ patch.unifiedDiff }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ElementInfo } from '@/utils/visualEditor'

const props = defineProps<{
  element: ElementInfo
  patch?: API.VisualPatchResult
  previewing?: boolean
  applying?: boolean
}>()

const emit = defineEmits<{
  close: []
  preview: [payload: API.VisualEditDraft]
  apply: [payload: API.VisualEditDraft]
}>()

const draft = reactive<API.VisualEditDraft>({
  textContent: '',
  className: '',
  color: '',
  backgroundColor: '',
  fontSize: '',
  borderRadius: '',
  instruction: '',
})

watch(
  () => props.element,
  (element) => {
    draft.textContent = element.textContent || ''
    draft.className = element.className || ''
    draft.color = ''
    draft.backgroundColor = ''
    draft.fontSize = ''
    draft.borderRadius = ''
    draft.instruction = ''
  },
  { immediate: true },
)

const elementLabel = computed(() => {
  const tag = props.element.tagName?.toLowerCase() || 'element'
  const id = props.element.id ? `#${props.element.id}` : ''
  const className = props.element.className ? `.${props.element.className.split(' ').join('.')}` : ''
  return `${tag}${id}${className}`
})

const handlePreview = () => {
  emit('preview', { ...draft })
}

const handleApply = () => {
  emit('apply', { ...draft })
}
</script>

<style scoped>
.visual-edit-panel {
  margin: 12px 0;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.panel-header,
.panel-actions,
.candidate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.panel-subtitle,
.candidate-title,
.candidate-item {
  font-size: 12px;
  color: #6b7280;
}

.patch-form {
  margin-top: 10px;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.panel-actions {
  justify-content: flex-end;
  margin-top: 8px;
}

.patch-message,
.candidate-list,
.diff-preview {
  margin-top: 10px;
}

.diff-preview {
  max-height: 220px;
  overflow: auto;
  padding: 10px;
  border-radius: 6px;
  background: #0f172a;
  color: #e5e7eb;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
