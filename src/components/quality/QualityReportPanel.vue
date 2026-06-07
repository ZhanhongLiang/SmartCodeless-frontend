<template>
  <div class="quality-panel">
    <div class="quality-header">
      <div>
        <div class="quality-title">质量检查</div>
        <div class="quality-subtitle">
          {{ task ? `任务 #${task.id}` : '尚未运行质量检查' }}
        </div>
      </div>
      <div class="quality-actions">
        <a-button size="small" :loading="checking" @click="$emit('check')">运行检查</a-button>
        <a-button
          size="small"
          type="primary"
          ghost
          :disabled="!task?.id"
          :loading="repairing"
          @click="$emit('repair')"
        >
          生成修复建议
        </a-button>
      </div>
    </div>

    <div v-if="task" class="quality-status">
      <a-tag :color="statusColor(task.status)">{{ statusText(task.status) }}</a-tag>
      <span v-if="task.currentStage">{{ stageText(task.currentStage) }}</span>
      <span v-if="task.score !== undefined && task.score !== null">评分：{{ task.score }}</span>
    </div>

    <div v-if="report" class="quality-grid">
      <div class="quality-metric">
        <span>依赖策略</span>
        <a-tag :color="passColor(report.dependencyPolicyStatus)">{{ checkText(report.dependencyPolicyStatus) }}</a-tag>
      </div>
      <div class="quality-metric">
        <span>脚本策略</span>
        <a-tag :color="passColor(report.scriptPolicyStatus)">{{ checkText(report.scriptPolicyStatus) }}</a-tag>
      </div>
      <div class="quality-metric">
        <span>构建检查</span>
        <a-tag :color="passColor(report.buildStatus)">{{ buildText(report.buildStatus) }}</a-tag>
      </div>
      <div class="quality-metric">
        <span>预览冒烟</span>
        <a-tag :color="passColor(report.previewSmokeStatus)">{{ checkText(report.previewSmokeStatus) }}</a-tag>
      </div>
    </div>

    <a-alert
      v-if="report?.failureCategory"
      class="quality-alert"
      type="warning"
      show-icon
      :message="`失败分类：${failureText(report.failureCategory)}`"
    />

    <a-collapse v-if="violations.length || attempts.length || report?.sanitizedLogSummary" size="small" ghost>
      <a-collapse-panel v-if="violations.length" key="violations" :header="`策略违规 (${violations.length})`">
        <div v-for="item in violations" :key="item.id" class="quality-list-item">
          <b>{{ item.packageName }}</b>
          <span>{{ item.violationType }}：{{ item.message }}</span>
        </div>
      </a-collapse-panel>
      <a-collapse-panel v-if="attempts.length" key="attempts" :header="`自愈尝试 (${attempts.length})`">
        <div v-for="attempt in attempts" :key="attempt.id" class="attempt-item">
          <div class="attempt-head">
            <span>第 {{ attempt.attemptNo }} 次：{{ repairText(attempt.status) }}</span>
            <a-button
              v-if="attempt.status === 'GENERATED'"
              size="small"
              type="primary"
              :loading="applying"
              @click="$emit('apply', attempt)"
            >
              应用补丁
            </a-button>
          </div>
          <div class="attempt-diagnosis">{{ attempt.diagnosis }}</div>
          <pre v-if="attempt.unifiedDiff" class="quality-diff">{{ attempt.unifiedDiff }}</pre>
        </div>
      </a-collapse-panel>
      <a-collapse-panel v-if="report?.sanitizedLogSummary" key="logs" header="脱敏日志摘要">
        <pre class="quality-log">{{ report.sanitizedLogSummary }}</pre>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  task?: API.QualityCheckTaskVO
  report?: API.QualityCheckReportVO
  violations: API.DependencyPolicyViolationVO[]
  attempts: API.SelfHealingAttemptVO[]
  checking?: boolean
  repairing?: boolean
  applying?: boolean
}>()

defineEmits<{
  check: []
  repair: []
  apply: [attempt: API.SelfHealingAttemptVO]
}>()

const statusColor = (status?: string) => {
  const map: Record<string, string> = {
    QUEUED: 'blue',
    RUNNING: 'processing',
    SUCCESS: 'success',
    FAILED: 'error',
    REPAIRABLE: 'warning',
  }
  return status ? map[status] || 'default' : 'default'
}

const passColor = (status?: string) => {
  if (status === 'PASS' || status === 'SUCCESS') return 'success'
  if (status === 'FAIL' || status === 'FAILED') return 'error'
  if (status === 'SKIP') return 'default'
  return 'processing'
}

const statusText = (status?: string) => {
  const map: Record<string, string> = {
    QUEUED: '排队中',
    RUNNING: '检查中',
    SUCCESS: '通过',
    FAILED: '失败',
    REPAIRABLE: '可修复',
  }
  return status ? map[status] || status : '未知'
}

const stageText = (stage?: string) => {
  const map: Record<string, string> = {
    POLICY_CHECKING: '策略检查',
    BUILD_CHECKING: '构建检查',
    PREVIEW_CHECKING: '预览冒烟',
    REPORTING: '生成报告',
    SELF_HEALING: '自愈修复',
  }
  return stage ? map[stage] || stage : ''
}

const checkText = (status?: string) => {
  const map: Record<string, string> = {
    PASS: '通过',
    FAIL: '失败',
    SKIP: '跳过',
    PENDING: '待处理',
  }
  return status ? map[status] || status : '未知'
}

const buildText = (status?: string) => {
  const map: Record<string, string> = {
    SUCCESS: '构建成功',
    FAILED: '构建失败',
    RUNNING: '构建中',
    QUEUED: '排队中',
    SKIP: '跳过',
  }
  return status ? map[status] || status : '未知'
}

const repairText = (status?: string) => {
  const map: Record<string, string> = {
    GENERATED: '已生成补丁',
    APPLIED: '已应用',
    FAILED: '修复失败',
    SKIPPED: '已跳过',
  }
  return status ? map[status] || status : '未知'
}

const failureText = (category?: string) => {
  const map: Record<string, string> = {
    DEPENDENCY_POLICY_ERROR: '依赖策略错误',
    NPM_SCRIPT_POLICY_ERROR: 'npm 脚本策略错误',
    DEPENDENCY_INSTALL_ERROR: '依赖安装错误',
    TYPESCRIPT_ERROR: 'TypeScript 错误',
    VITE_BUILD_ERROR: 'Vite 构建错误',
    IMPORT_RESOLUTION_ERROR: '导入解析错误',
    ROUTE_ERROR: '路由错误',
    PREVIEW_HTTP_ERROR: '预览访问错误',
    PREVIEW_BLANK_SCREEN: '预览白屏',
    SECURITY_POLICY_ERROR: '安全策略错误',
    UNKNOWN_ERROR: '未知错误',
  }
  return category ? map[category] || category : ''
}
</script>

<style scoped>
.quality-panel {
  margin: 12px 0;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.quality-header,
.quality-actions,
.quality-status,
.quality-metric,
.attempt-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-header {
  justify-content: space-between;
}

.quality-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.quality-subtitle,
.quality-status,
.quality-list-item,
.attempt-diagnosis {
  font-size: 12px;
  color: #6b7280;
}

.quality-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.quality-metric {
  justify-content: space-between;
  padding: 8px;
  border-radius: 6px;
  background: #f9fafb;
}

.quality-alert,
.quality-list-item,
.attempt-item {
  margin-top: 10px;
}

.quality-list-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.attempt-head {
  justify-content: space-between;
}

.quality-diff,
.quality-log {
  max-height: 220px;
  overflow: auto;
  margin-top: 8px;
  padding: 10px;
  border-radius: 6px;
  background: #0f172a;
  color: #e5e7eb;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
