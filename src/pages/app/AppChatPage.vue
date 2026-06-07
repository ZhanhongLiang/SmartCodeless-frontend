<template>
  <div id="appChatPage">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <div class="header-left">
        <h1 class="app-name">{{ appInfo?.appName || '网站生成器' }}</h1>
        <a-tag v-if="appInfo?.codeGenType" color="blue" class="code-gen-type-tag">
          {{ formatCodeGenType(appInfo.codeGenType) }}
        </a-tag>
      </div>
      <div class="header-right">
        <a-button type="default" @click="showAppDetail">
          <template #icon>
            <InfoCircleOutlined />
          </template>
          应用详情
        </a-button>
        <a-button type="default" @click="openVersionDrawer" :disabled="!isOwner && !isAdmin">
          <template #icon>
            <HistoryOutlined />
          </template>
          版本历史
        </a-button>
        <a-button type="default" @click="runQualityCheck" :loading="qualityChecking" :disabled="!isOwner">
          <template #icon>
            <SafetyCertificateOutlined />
          </template>
          质量检查
        </a-button>
        <a-button
          type="primary"
          ghost
          @click="downloadCode"
          :loading="downloading"
          :disabled="!isOwner"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
          下载代码
        </a-button>
        <a-button type="primary" @click="deployApp" :loading="deploying">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          部署
        </a-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧对话区域 -->
      <div class="chat-section">
        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <!-- 加载更多按钮 -->
          <div v-if="hasMoreHistory" class="load-more-container">
            <a-button type="link" @click="loadMoreHistory" :loading="loadingHistory" size="small">
              加载更多历史消息
            </a-button>
          </div>
          <div v-for="(message, index) in messages" :key="index" class="message-item">
            <div v-if="message.type === 'user'" class="user-message">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-avatar">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
              </div>
            </div>
            <div v-else class="ai-message">
              <div class="message-avatar">
                <a-avatar :src="aiAvatar" />
              </div>
              <div class="message-content">
                <div v-if="message.loading && message.content" class="streaming-content">
                  {{ message.content }}
                </div>
                <MarkdownRenderer v-else-if="message.content" :content="message.content" />
                <div v-if="message.loading" class="loading-indicator">
                  <a-spin size="small" />
                  <span>AI 正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 选中元素信息展示 -->
        <div v-if="agentTimeline.length > 0" class="agent-timeline">
          <div class="agent-timeline-header">
            <span>智能体执行时间线</span>
            <a-tag v-if="currentAgentStatus" color="processing">
              {{ formatAgentStatus(currentAgentStatus) }}
            </a-tag>
          </div>
          <div class="agent-timeline-list">
            <div
              v-for="item in agentTimeline"
              :key="item.id"
              class="agent-timeline-item"
              :class="`agent-${item.kind}`"
            >
              <div class="agent-timeline-main">
                <span class="agent-timeline-kind">{{ formatAgentKind(item.kind) }}</span>
                <span class="agent-timeline-title">{{ formatAgentTitle(item.title) }}</span>
                <span class="agent-timeline-time">{{ item.time }}</span>
              </div>
              <div v-if="item.detail && item.kind !== 'diff'" class="agent-timeline-detail">
                {{ item.detail }}
              </div>
              <a-collapse v-if="item.kind === 'diff' && item.detail" size="small" ghost>
                <a-collapse-panel key="diff" :header="item.title">
                  <pre class="agent-diff-content">{{ item.detail }}</pre>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </div>
        </div>

        <div v-if="buildTaskId || buildStatus" class="build-progress-panel">
          <div class="build-progress-header">
            <div>
              <span class="build-title">构建进度</span>
              <a-tag v-if="buildStatus" :color="getBuildStatusColor(buildStatus)">
                {{ formatBuildStatus(buildStatus) }}
              </a-tag>
            </div>
            <span v-if="buildTaskId" class="build-task-id">#{{ buildTaskId }}</span>
          </div>
          <div v-if="buildError" class="build-error">{{ buildError }}</div>
          <a-collapse v-if="buildLogs.length > 0" size="small" ghost>
            <a-collapse-panel key="logs" :header="`构建日志 (${buildLogs.length})`">
              <div class="build-log-list">
                <div v-for="log in buildLogs" :key="log.id" class="build-log-line">
                  <span class="build-log-type">{{ formatBuildLogType(log.logType) }}</span>
                  <span class="build-log-content">{{ log.content }}</span>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>

        <QualityReportPanel
          v-if="qualityTask || qualityReport"
          :task="qualityTask"
          :report="qualityReport"
          :violations="qualityViolations"
          :attempts="selfHealingAttempts"
          :checking="qualityChecking"
          :repairing="qualityRepairing"
          :applying="qualityRepairApplying"
          @check="runQualityCheck"
          @repair="createQualityRepair"
          @apply="applyQualityRepair"
        />

        <a-alert
          v-if="selectedElementInfo"
          class="selected-element-alert"
          type="info"
          closable
          @close="clearSelectedElement"
        >
          <template #message>
            <div class="selected-element-info">
              <div class="element-header">
                <span class="element-tag">
                  选中元素：{{ selectedElementInfo.tagName.toLowerCase() }}
                </span>
                <span v-if="selectedElementInfo.id" class="element-id">
                  #{{ selectedElementInfo.id }}
                </span>
                <span v-if="selectedElementInfo.className" class="element-class">
                  .{{ selectedElementInfo.className.split(' ').join('.') }}
                </span>
              </div>
              <div class="element-details">
                <div v-if="selectedElementInfo.textContent" class="element-item">
                  内容: {{ selectedElementInfo.textContent.substring(0, 50) }}
                  {{ selectedElementInfo.textContent.length > 50 ? '...' : '' }}
                </div>
                <div v-if="selectedElementInfo.pagePath" class="element-item">
                  页面路径: {{ selectedElementInfo.pagePath }}
                </div>
                <div class="element-item">
                  选择器:
                  <code class="element-selector-code">{{ selectedElementInfo.selector }}</code>
                </div>
              </div>
            </div>
          </template>
        </a-alert>

        <VisualEditPanel
          v-if="selectedElementInfo"
          :element="selectedElementInfo"
          :patch="visualPatch"
          :previewing="visualPatchPreviewing"
          :applying="visualPatchApplying"
          @preview="previewVisualPatch"
          @apply="applyVisualPatch"
          @close="clearSelectedElement"
        />

        <!-- 用户消息输入框 -->
        <div class="input-container">
          <div class="input-wrapper">
            <a-tooltip v-if="!isOwner" title="无法在别人的作品下对话哦~" placement="top">
              <a-textarea
                v-model:value="userInput"
                :placeholder="getInputPlaceholder()"
                :rows="4"
                :maxlength="1000"
                @keydown.enter.prevent="sendMessage"
                :disabled="isGenerating || !isOwner"
              />
            </a-tooltip>
            <a-textarea
              v-else
              v-model:value="userInput"
              :placeholder="getInputPlaceholder()"
              :rows="4"
              :maxlength="1000"
              @keydown.enter.prevent="sendMessage"
              :disabled="isGenerating"
            />
            <div class="input-actions">
              <a-button
                type="primary"
                @click="sendMessage"
                :loading="isGenerating"
                :disabled="!isOwner"
              >
                <template #icon>
                  <SendOutlined />
                </template>
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧网页展示区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>生成后的网页展示</h3>
          <div class="preview-actions">
            <a-tag v-if="sandboxStatus" :color="getSandboxStatusColor(sandboxStatus)">
              {{ formatSandboxStatus(sandboxStatus) }}
            </a-tag>
            <a-button
              v-if="isOwner && appInfo?.deployKey"
              type="link"
              :loading="sandboxStarting"
              @click="handleSandboxClick"
            >
              沙盒预览
            </a-button>
            <a-button
              v-if="isOwner && previewUrl"
              type="link"
              :danger="isEditMode"
              @click="toggleEditMode"
              :class="{ 'edit-mode-active': isEditMode }"
              style="padding: 0; height: auto; margin-right: 12px"
            >
              <template #icon>
                <EditOutlined />
              </template>
              {{ isEditMode ? '退出编辑' : '编辑模式' }}
            </a-button>
            <a-button v-if="previewUrl" type="link" @click="openInNewTab">
              <template #icon>
                <ExportOutlined />
              </template>
              新窗口打开
            </a-button>
          </div>
        </div>
        <div v-if="sandboxError" class="sandbox-hint">{{ sandboxError }}</div>
        <div class="preview-content">
          <div v-if="!previewUrl && !isGenerating" class="preview-placeholder">
            <div class="placeholder-icon">🌐</div>
            <p>网站文件生成完成后将在这里展示</p>
          </div>
          <div v-else-if="isGenerating" class="preview-loading">
            <a-spin size="large" />
            <p>正在生成网站...</p>
          </div>
          <iframe
            v-else
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
            @load="onIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
      v-model:open="appDetailVisible"
      :app="appInfo"
      :show-actions="isOwner || isAdmin"
      @edit="editApp"
      @delete="deleteApp"
    />

    <!-- 部署成功弹窗 -->
    <DeploySuccessModal
      v-model:open="deployModalVisible"
      :deploy-url="deployUrl"
      @open-site="openDeployedSite"
    />

    <a-drawer
      v-model:open="versionDrawerVisible"
      title="版本历史"
      width="520"
      placement="right"
      @open-change="handleVersionDrawerOpenChange"
    >
      <a-spin :spinning="versionLoading">
        <a-empty v-if="appVersions.length === 0 && !versionLoading" description="暂无版本记录" />
        <div v-else class="version-list">
          <div v-for="version in appVersions" :key="version.id" class="version-item">
            <div class="version-item-header">
              <div>
                <span class="version-round">第 {{ version.roundNo }} 轮</span>
                <a-tag :color="version.versionType === 'ROLLBACK' ? 'orange' : 'blue'">
                  {{ formatVersionType(version.versionType) }}
                </a-tag>
              </div>
              <code class="version-commit">{{ version.shortCommitId || version.commitId }}</code>
            </div>
            <div class="version-summary">
              {{ version.promptSummary || version.commitMessage }}
            </div>
            <div class="version-meta">
              <span>{{ version.createTime }}</span>
              <span v-if="version.buildTaskId">构建任务 #{{ version.buildTaskId }}</span>
            </div>
            <div class="version-actions">
              <a-button
                size="small"
                danger
                :loading="versionRollingBack"
                :disabled="!version.commitId || versionRollingBack"
                @click="confirmRollback(version)"
              >
                <template #icon>
                  <RollbackOutlined />
                </template>
                回滚到此版本
              </a-button>
            </div>
          </div>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import {
  getAppVoById,
  deployApp as deployAppApi,
  getBuildTask,
  listBuildLogs,
  getSandboxStatus,
  startSandboxPreview,
  previewVisualEdit,
  applyVisualEdit,
  submitQualityCheck,
  getQualityTask,
  latestQualityReport,
  listQualityViolations,
  createSelfHealingAttempt,
  applySelfHealingAttempt,
  listSelfHealingAttempts,
  listAppVersions,
  rollbackAppVersion,
  deleteApp as deleteAppApi,
} from '@/api/appController'
import { listAppChatHistory } from '@/api/chatHistoryController'
import { CodeGenTypeEnum, formatCodeGenType } from '@/utils/codeGenTypes'
import request from '@/request'

import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import DeploySuccessModal from '@/components/DeploySuccessModal.vue'
import VisualEditPanel from '@/components/visual-edit/VisualEditPanel.vue'
import QualityReportPanel from '@/components/quality/QualityReportPanel.vue'
import aiAvatar from '@/assets/aiAvatar.png'
import { API_BASE_URL, getSandboxPreviewUrl, getStaticPreviewUrl } from '@/config/env'
import { VisualEditor, type ElementInfo } from '@/utils/visualEditor'

import {
  CloudUploadOutlined,
  SendOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  HistoryOutlined,
  RollbackOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
const appId = ref<any>()

// 对话相关
interface Message {
  type: 'user' | 'ai'
  content: string
  loading?: boolean
  createTime?: string
}

const messages = ref<Message[]>([])
const userInput = ref('')
const isGenerating = ref(false)
const messagesContainer = ref<HTMLElement>()
const activeEventSource = ref<EventSource | null>(null)

type AgentTimelineKind = 'status' | 'tool' | 'diff' | 'error' | 'done'

interface AgentTimelineItem {
  id: string
  kind: AgentTimelineKind
  title: string
  detail?: string
  time: string
}

interface AgentStreamEvent {
  requestId: string
  appId: number
  type: string
  timestamp: number
  payload?: Record<string, any>
}

const agentTimeline = ref<AgentTimelineItem[]>([])
const currentAgentStatus = ref('')

// 对话历史相关
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const lastCreateTime = ref<string>()
const historyLoaded = ref(false)

// 预览相关
const previewUrl = ref('')
const previewReady = ref(false)
const sandboxStatus = ref('')
const sandboxError = ref('')
const sandboxStarting = ref(false)

// 部署相关
const deploying = ref(false)
const deployModalVisible = ref(false)
const deployUrl = ref('')
const buildTaskId = ref<number>()
const buildStatus = ref('')
const buildError = ref('')
const buildLogs = ref<API.BuildLogVO[]>([])
let buildPollingTimer: number | undefined

const qualityTask = ref<API.QualityCheckTaskVO>()
const qualityReport = ref<API.QualityCheckReportVO>()
const qualityViolations = ref<API.DependencyPolicyViolationVO[]>([])
const selfHealingAttempts = ref<API.SelfHealingAttemptVO[]>([])
const qualityChecking = ref(false)
const qualityRepairing = ref(false)
const qualityRepairApplying = ref(false)
let qualityPollingTimer: number | undefined

const versionDrawerVisible = ref(false)
const versionLoading = ref(false)
const versionRollingBack = ref(false)
const appVersions = ref<API.AppVersionVO[]>([])

// 下载相关
const downloading = ref(false)

// 可视化编辑相关
const isEditMode = ref(false)
const selectedElementInfo = ref<ElementInfo | null>(null)
const visualPatch = ref<API.VisualPatchResult>()
const visualPatchPreviewing = ref(false)
const visualPatchApplying = ref(false)
const visualEditor = new VisualEditor({
  onElementSelected: (elementInfo: ElementInfo) => {
    selectedElementInfo.value = elementInfo
    visualPatch.value = undefined
  },
})

// 权限相关
const isOwner = computed(() => {
  return appInfo.value?.userId === loginUserStore.loginUser.id
})

const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 应用详情相关
const appDetailVisible = ref(false)

// 显示应用详情
const showAppDetail = () => {
  appDetailVisible.value = true
}

// 加载对话历史
const loadChatHistory = async (isLoadMore = false) => {
  if (!appId.value || loadingHistory.value) return
  loadingHistory.value = true
  try {
    const params: API.listAppChatHistoryParams = {
      appId: appId.value,
      pageSize: 10,
    }
    // 如果是加载更多，传递最后一条消息的创建时间作为游标
    if (isLoadMore && lastCreateTime.value) {
      params.lastCreateTime = lastCreateTime.value
    }
    const res = await listAppChatHistory(params)
    if (res.data.code === 0 && res.data.data) {
      const chatHistories = res.data.data.records || []
      if (chatHistories.length > 0) {
        // 将对话历史转换为消息格式，并按时间正序排列（老消息在前）
        const historyMessages: Message[] = chatHistories
          .map((chat) => ({
            type: (chat.messageType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
            content: chat.message || '',
            createTime: chat.createTime,
          }))
          .reverse() // 反转数组，让老消息在前
        if (isLoadMore) {
          // 加载更多时，将历史消息添加到开头
          messages.value.unshift(...historyMessages)
        } else {
          // 初始加载，直接设置消息列表
          messages.value = historyMessages
        }
        // 更新游标
        lastCreateTime.value = chatHistories[chatHistories.length - 1]?.createTime
        // 检查是否还有更多历史
        hasMoreHistory.value = chatHistories.length === 10
      } else {
        hasMoreHistory.value = false
      }
      historyLoaded.value = true
    }
  } catch (error) {
    console.error('加载对话历史失败：', error)
    message.error('加载对话历史失败')
  } finally {
    loadingHistory.value = false
  }
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  await loadChatHistory(true)
}

// 获取应用信息
const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('应用ID不存在')
    router.push('/')
    return
  }

  appId.value = id

  try {
    const res = await getAppVoById({ id: id as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data
      syncBuildStateFromApp()

      // 先加载对话历史
      await loadChatHistory()
      // 如果有至少2条对话记录，展示对应的网站
      if (messages.value.length >= 2) {
        updatePreview()
      }
      // 检查是否需要自动发送初始提示词
      // 只有在是自己的应用且没有对话历史时才自动发送
      if (
        appInfo.value.initPrompt &&
        isOwner.value &&
        messages.value.length === 0 &&
        historyLoaded.value
      ) {
        await sendInitialMessage(appInfo.value.initPrompt)
      }
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    console.error('获取应用信息失败：', error)
    message.error('获取应用信息失败')
    router.push('/')
  }
}

// 发送初始消息
const sendInitialMessage = async (prompt: string) => {
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: prompt,
  })

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(prompt, aiMessageIndex)
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) {
    return
  }

  let message = userInput.value.trim()
  // 如果有选中的元素，将元素信息添加到提示词中
  if (selectedElementInfo.value) {
    let elementContext = `\n\n选中元素信息：`
    if (selectedElementInfo.value.pagePath) {
      elementContext += `\n- 页面路径: ${selectedElementInfo.value.pagePath}`
    }
    elementContext += `\n- 标签: ${selectedElementInfo.value.tagName.toLowerCase()}\n- 选择器: ${selectedElementInfo.value.selector}`
    if (selectedElementInfo.value.textContent) {
      elementContext += `\n- 当前内容: ${selectedElementInfo.value.textContent.substring(0, 100)}`
    }
    message += elementContext
  }
  userInput.value = ''
  // 添加用户消息（包含元素信息）
  messages.value.push({
    type: 'user',
    content: message,
  })

  // 发送消息后，清除选中元素并退出编辑模式
  if (selectedElementInfo.value) {
    clearSelectedElement()
    if (isEditMode.value) {
      toggleEditMode()
    }
  }

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(message, aiMessageIndex)
}

// 生成代码 - 优先使用 Agent SSE v2，必要时回退旧接口
const generateCode = async (userMessage: string, aiMessageIndex: number) => {
  let eventSource: EventSource | null = null
  let streamCompleted = false
  let receivedV2Event = false
  let fullContent = ''
  let pendingFlushTimer: number | null = null

  const flushContent = () => {
    pendingFlushTimer = null
    messages.value[aiMessageIndex].content = fullContent
    scrollToBottom()
  }

  const appendContent = (content?: string) => {
    if (streamCompleted || content === undefined || content === null) return
    fullContent += content
    if (pendingFlushTimer === null) {
      pendingFlushTimer = window.setTimeout(flushContent, 120)
    }
  }

  const finishStreamingContent = () => {
    if (pendingFlushTimer !== null) {
      window.clearTimeout(pendingFlushTimer)
    }
    pendingFlushTimer = null
    messages.value[aiMessageIndex].content = fullContent
    messages.value[aiMessageIndex].loading = false
    scrollToBottom()
  }

  const parseAgentEvent = (event: MessageEvent): AgentStreamEvent | null => {
    try {
      receivedV2Event = true
      return JSON.parse(event.data)
    } catch (error) {
      console.error('Agent event parse failed:', error, event.data)
      return null
    }
  }

  try {
    const baseURL = request.defaults.baseURL || API_BASE_URL
    const params = new URLSearchParams({
      appId: appId.value || '',
      message: userMessage,
      clientRequestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      enableDiff: 'true',
    })

    const url = `${baseURL}/app/chat/gen/code/v2?${params}`
    eventSource = new EventSource(url, { withCredentials: true })
    activeEventSource.value = eventSource
    agentTimeline.value = []
    currentAgentStatus.value = ''

    eventSource.addEventListener('status', (event: MessageEvent) => {
      const data = parseAgentEvent(event)
      const payload = data?.payload || {}
      currentAgentStatus.value = payload.stage || ''
      addAgentTimelineItem('status', payload.stage || 'status', payload.message)
    })

    eventSource.addEventListener('tool_call', (event: MessageEvent) => {
      const data = parseAgentEvent(event)
      const payload = data?.payload || {}
      addAgentTimelineItem('tool', `${payload.toolName || 'tool'} ${payload.status || ''}`.trim(), payload.summary)
    })

    eventSource.addEventListener('file_diff', (event: MessageEvent) => {
      const data = parseAgentEvent(event)
      const payload = data?.payload || {}
      addAgentTimelineItem('diff', `${payload.changeType || 'change'} ${payload.path || ''}`.trim(), payload.diff)
    })

    eventSource.addEventListener('thought', (event: MessageEvent) => {
      appendContent(parseAgentEvent(event)?.payload?.content)
    })

    eventSource.addEventListener('code_block', (event: MessageEvent) => {
      appendContent(parseAgentEvent(event)?.payload?.content)
    })

    eventSource.addEventListener('message', (event: MessageEvent) => {
      appendContent(parseAgentEvent(event)?.payload?.content)
    })

    eventSource.addEventListener('done', (event: MessageEvent) => {
      if (streamCompleted) return
      parseAgentEvent(event)
      addAgentTimelineItem('done', 'completed')
      streamCompleted = true
      finishStreamingContent()
      isGenerating.value = false
      eventSource?.close()
      setTimeout(async () => {
        await fetchAppInfo()
        updatePreview()
      }, 1000)
    })

    eventSource.addEventListener('error', (event: MessageEvent) => {
      if (streamCompleted || !event.data) return
      const data = parseAgentEvent(event)
      const errorMessage = data?.payload?.message || '生成过程中出现错误'
      addAgentTimelineItem('error', 'system error', errorMessage)
      messages.value[aiMessageIndex].content = `Error: ${errorMessage}`
      messages.value[aiMessageIndex].loading = false
      message.error(errorMessage)
      streamCompleted = true
      isGenerating.value = false
      eventSource?.close()
    })

    eventSource.addEventListener('business-error', (event: MessageEvent) => {
      if (streamCompleted) return
      const data = parseAgentEvent(event)
      const errorMessage = data?.payload?.message || '生成过程中出现错误'
      addAgentTimelineItem('error', 'business error', errorMessage)
      messages.value[aiMessageIndex].content = `Error: ${errorMessage}`
      messages.value[aiMessageIndex].loading = false
      message.error(errorMessage)
      streamCompleted = true
      isGenerating.value = false
      eventSource?.close()
    })

    eventSource.onerror = function () {
      if (streamCompleted || !isGenerating.value) return
      if (!receivedV2Event) {
        streamCompleted = true
        eventSource?.close()
        generateCodeLegacy(userMessage, aiMessageIndex)
        return
      }
      handleError(new Error('SSE连接错误'), aiMessageIndex)
      eventSource?.close()
    }
  } catch (error) {
    handleError(error, aiMessageIndex)
  }
}

const addAgentTimelineItem = (kind: AgentTimelineKind, title: string, detail?: string) => {
  agentTimeline.value.push({
    id: `${Date.now()}-${agentTimeline.value.length}`,
    kind,
    title,
    detail,
    time: new Date().toLocaleTimeString(),
  })
  if (agentTimeline.value.length > 80) {
    agentTimeline.value.splice(0, agentTimeline.value.length - 80)
  }
}

const generateCodeLegacy = async (userMessage: string, aiMessageIndex: number) => {
  let eventSource: EventSource | null = null
  let streamCompleted = false
  try {
    const baseURL = request.defaults.baseURL || API_BASE_URL
    const params = new URLSearchParams({
      appId: appId.value || '',
      message: userMessage,
    })
    const url = `${baseURL}/app/chat/gen/code?${params}`
    eventSource = new EventSource(url, { withCredentials: true })
    activeEventSource.value = eventSource
    addAgentTimelineItem('status', 'legacy-stream', 'v2 unavailable, using compatible legacy stream')
    let fullContent = ''
    let pendingFlushTimer: number | null = null

    const flushContent = () => {
      pendingFlushTimer = null
      messages.value[aiMessageIndex].content = fullContent
      scrollToBottom()
    }

    const appendLegacyContent = (content?: string) => {
      if (streamCompleted || content === undefined || content === null) return
      fullContent += content
      if (pendingFlushTimer === null) {
        pendingFlushTimer = window.setTimeout(flushContent, 120)
      }
    }

    const finishLegacyContent = () => {
      if (pendingFlushTimer !== null) {
        window.clearTimeout(pendingFlushTimer)
      }
      pendingFlushTimer = null
      messages.value[aiMessageIndex].content = fullContent
      messages.value[aiMessageIndex].loading = false
      scrollToBottom()
    }

    eventSource.onmessage = function (event) {
      if (streamCompleted) return
      try {
        const parsed = JSON.parse(event.data)
        appendLegacyContent(parsed.d)
      } catch (error) {
        handleError(error, aiMessageIndex)
      }
    }

    eventSource.addEventListener('done', function () {
      if (streamCompleted) return
      streamCompleted = true
      finishLegacyContent()
      isGenerating.value = false
      eventSource?.close()
      setTimeout(async () => {
        await fetchAppInfo()
        updatePreview()
      }, 1000)
    })

    eventSource.addEventListener('business-error', function (event: MessageEvent) {
      if (streamCompleted) return
      const errorData = JSON.parse(event.data)
      const errorMessage = errorData.message || '生成过程中出现错误'
      messages.value[aiMessageIndex].content = `Error: ${errorMessage}`
      messages.value[aiMessageIndex].loading = false
      message.error(errorMessage)
      streamCompleted = true
      isGenerating.value = false
      eventSource?.close()
    })

    eventSource.onerror = function () {
      if (streamCompleted || !isGenerating.value) return
      handleError(new Error('SSE连接错误'), aiMessageIndex)
      eventSource?.close()
    }
  } catch (error) {
    handleError(error, aiMessageIndex)
  }
}

// 错误处理函数
const handleError = (error: unknown, aiMessageIndex: number) => {
  console.error('生成代码失败：', error)
  messages.value[aiMessageIndex].content = '抱歉，生成过程中出现了错误，请重试。'
  messages.value[aiMessageIndex].loading = false
  message.error('生成失败，请重试')
  isGenerating.value = false
}

// 更新预览
const updatePreview = () => {
  if (!appId.value) return
  const codeGenType = appInfo.value?.codeGenType || CodeGenTypeEnum.HTML
  previewUrl.value = getStaticPreviewUrl(codeGenType, appId.value)
  previewReady.value = true
  syncSandboxPreview()
}

const syncSandboxPreview = async () => {
  if (!appId.value) return
  try {
    const res = await getSandboxStatus({ appId: appId.value as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      applySandboxStatus(res.data.data)
    }
  } catch (error) {
    sandboxStatus.value = 'unavailable'
  }
}

const applySandboxStatus = (status: API.SandboxStatusResponse) => {
  sandboxStatus.value = status.status || ''
  sandboxError.value =
    status.status === 'failed' || status.status === 'unavailable' ? status.errorMessage || '' : ''
  if (status.status === 'running') {
    previewUrl.value = getSandboxPreviewUrl(appId.value)
    previewReady.value = false
  }
}

const restartSandboxPreview = async () => {
  if (!appId.value) return
  sandboxStarting.value = true
  sandboxError.value = ''
  try {
    const res = await startSandboxPreview({ appId: appId.value as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      applySandboxStatus(res.data.data)
      if (res.data.data.status === 'running') {
        message.success('沙盒预览运行中')
      } else {
        message.warning(res.data.data.errorMessage || '沙盒预览不可用')
      }
    } else {
      message.error(res.data.message || '启动沙盒预览失败')
    }
  } catch (error) {
    console.error('Start sandbox failed:', error)
    message.error('启动沙盒预览失败')
  } finally {
    sandboxStarting.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 下载代码
const handleSandboxClick = async () => {
  if (!appId.value) return
  if (sandboxStatus.value === 'running') {
    const url = getSandboxPreviewUrl(appId.value)
    previewUrl.value = url
    window.open(url, '_blank')
    return
  }
  await restartSandboxPreview()
}

const downloadCode = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }
  downloading.value = true
  try {
    const API_BASE_URL = request.defaults.baseURL || ''
    const url = `${API_BASE_URL}/app/download/${appId.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId.value}.zip`
    // 下载文件
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    link.click()
    // 清理
    URL.revokeObjectURL(downloadUrl)
    message.success('代码下载成功')
  } catch (error) {
    console.error('下载失败：', error)
    message.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

const getBuildStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    QUEUED: 'blue',
    RUNNING: 'processing',
    SUCCESS: 'success',
    FAILED: 'error',
    CANCELED: 'default',
    NONE: 'default',
  }
  return colorMap[status] || 'default'
}

const getSandboxStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    starting: 'processing',
    running: 'success',
    failed: 'error',
    stopped: 'default',
    unavailable: 'warning',
  }
  return colorMap[status] || 'default'
}

const formatBuildStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    QUEUED: '排队中',
    RUNNING: '构建中',
    SUCCESS: '构建成功',
    FAILED: '构建失败',
    CANCELED: '已取消',
    NONE: '未构建',
  }
  return status ? statusMap[status] || status : ''
}

const formatSandboxStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    starting: '启动中',
    running: '运行中',
    failed: '启动失败',
    stopped: '已停止',
    unavailable: '不可用',
  }
  return status ? statusMap[status] || status : ''
}

const formatVersionType = (type?: string) => {
  const typeMap: Record<string, string> = {
    AI_GENERATION: 'AI 生成',
    ROLLBACK: '版本回滚',
  }
  return type ? typeMap[type] || type : ''
}

const formatAgentKind = (kind: AgentTimelineKind) => {
  const kindMap: Record<AgentTimelineKind, string> = {
    status: '状态',
    tool: '工具',
    diff: '差异',
    error: '错误',
    done: '完成',
  }
  return kindMap[kind] || kind
}

const formatAgentStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    preparing: '准备请求',
    'saving-user-message': '保存用户消息',
    generating: 'AI 生成中',
    'building-preview': '构建预览',
    'saving-history': '保存对话历史',
    'refreshing-preview': '刷新预览',
    versioning: '创建版本快照',
    versioned: '版本快照完成',
    'version-failed': '版本快照失败',
  }
  return status ? statusMap[status] || status : ''
}

const formatAgentTitle = (title?: string) => {
  const titleMap: Record<string, string> = {
    completed: '执行完成',
    'system error': '系统错误',
    'business error': '业务错误',
  }
  if (!title) return ''
  let formatted = titleMap[title] || title
  formatted = formatted
    .replace('started', '开始')
    .replace('running', '执行中')
    .replace('success', '成功')
    .replace('failed', '失败')
    .replace('change', '变更')
    .replace('create', '创建')
    .replace('update', '更新')
    .replace('delete', '删除')
  return formatted
}

const formatBuildLogType = (type?: string) => {
  const typeMap: Record<string, string> = {
    INFO: '信息',
    ERROR: '错误',
    WARN: '警告',
    WARNING: '警告',
    STDOUT: '标准输出',
    STDERR: '错误输出',
    SYSTEM: '系统',
    TOOL: '工具',
  }
  return type ? typeMap[type] || type : ''
}

const isBuildTerminal = (status?: string) => {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELED'
}

const clearBuildPolling = () => {
  if (buildPollingTimer) {
    window.clearInterval(buildPollingTimer)
    buildPollingTimer = undefined
  }
}

const syncBuildStateFromApp = () => {
  if (!appInfo.value) return
  buildStatus.value = appInfo.value.deployStatus || ''
  buildError.value = appInfo.value.buildErrorMessage || ''
  if (appInfo.value.buildTaskId) {
    buildTaskId.value = appInfo.value.buildTaskId
    if (!isBuildTerminal(buildStatus.value)) {
      startBuildPolling(appInfo.value.buildTaskId)
    }
  }
}

const fetchBuildLogs = async (taskId: number) => {
  const lastId = buildLogs.value.length ? buildLogs.value[buildLogs.value.length - 1].id : undefined
  const res = await listBuildLogs({ taskId, lastId, pageSize: 100 })
  if (res.data.code === 0 && res.data.data?.length) {
    buildLogs.value.push(...res.data.data)
  }
}

const fetchBuildTask = async (taskId: number) => {
  const res = await getBuildTask({ taskId })
  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.message || '获取构建任务失败')
  }
  const task = res.data.data
  buildStatus.value = task.status || ''
  buildError.value = task.errorMessage || ''
  if (task.deployUrl) {
    deployUrl.value = task.deployUrl
  }
  await fetchBuildLogs(taskId)
  if (isBuildTerminal(task.status)) {
    clearBuildPolling()
    deploying.value = false
    if (task.status === 'SUCCESS') {
      message.success('构建成功，已刷新预览')
      deployModalVisible.value = true
      await fetchAppInfo()
      updatePreview()
    } else if (task.status === 'FAILED') {
      message.error('构建失败，请查看构建日志')
    }
  }
}

const startBuildPolling = (taskId: number) => {
  clearBuildPolling()
  buildPollingTimer = window.setInterval(() => {
    fetchBuildTask(taskId).catch((error) => {
      console.error('查询构建任务失败：', error)
    })
  }, 2000)
  fetchBuildTask(taskId).catch((error) => {
    console.error('查询构建任务失败：', error)
  })
}

// 部署应用
const isQualityTerminal = (status?: string) => {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'REPAIRABLE'
}

const clearQualityPolling = () => {
  if (qualityPollingTimer) {
    window.clearInterval(qualityPollingTimer)
    qualityPollingTimer = undefined
  }
}

const loadQualityDetails = async (taskId: number) => {
  const [violationRes, attemptRes] = await Promise.all([
    listQualityViolations({ taskId }),
    listSelfHealingAttempts({ taskId }),
  ])
  if (violationRes.data.code === 0) {
    qualityViolations.value = violationRes.data.data || []
  }
  if (attemptRes.data.code === 0) {
    selfHealingAttempts.value = attemptRes.data.data || []
  }
}

const loadLatestQualityReport = async () => {
  if (!appId.value) return
  try {
    const res = await latestQualityReport({ appId: appId.value as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      qualityReport.value = res.data.data
      if (res.data.data.taskId) {
        await loadQualityDetails(res.data.data.taskId)
      }
    }
  } catch (error) {
    console.error('加载质量报告失败：', error)
  }
}

const fetchQualityTask = async (taskId: number) => {
  const res = await getQualityTask({ taskId })
  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.message || '获取质量检查任务失败')
  }
  qualityTask.value = res.data.data
  if (isQualityTerminal(res.data.data.status)) {
    clearQualityPolling()
    qualityChecking.value = false
    await loadLatestQualityReport()
    if (res.data.data.status === 'SUCCESS') {
      message.success('质量检查通过')
    } else if (res.data.data.status === 'REPAIRABLE') {
      message.warning('质量检查发现可修复问题')
    } else {
      message.error('质量检查失败')
    }
  }
}

const startQualityPolling = (taskId: number) => {
  clearQualityPolling()
  qualityPollingTimer = window.setInterval(() => {
    fetchQualityTask(taskId).catch((error) => {
      console.error('查询质量检查任务失败：', error)
    })
  }, 2500)
  fetchQualityTask(taskId).catch((error) => {
    console.error('查询质量检查任务失败：', error)
  })
}

const runQualityCheck = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }
  qualityChecking.value = true
  try {
    const res = await submitQualityCheck({
      appId: appId.value as unknown as number,
      triggerType: 'MANUAL',
      autoRepair: false,
    })
    if (res.data.code === 0 && res.data.data?.id) {
      qualityTask.value = res.data.data
      qualityReport.value = undefined
      qualityViolations.value = []
      selfHealingAttempts.value = []
      message.success('质量检查任务已提交')
      startQualityPolling(res.data.data.id)
    } else {
      message.error(res.data.message || '提交质量检查失败')
      qualityChecking.value = false
    }
  } catch (error) {
    console.error('提交质量检查失败：', error)
    message.error('提交质量检查失败')
    qualityChecking.value = false
  }
}

const createQualityRepair = async () => {
  if (!qualityTask.value?.id || !appId.value) {
    message.warning('请先运行质量检查')
    return
  }
  qualityRepairing.value = true
  try {
    const res = await createSelfHealingAttempt({
      taskId: qualityTask.value.id,
      appId: appId.value as unknown as number,
    })
    if (res.data.code === 0 && res.data.data) {
      selfHealingAttempts.value = [res.data.data, ...selfHealingAttempts.value]
      message.success('自愈修复建议已生成')
    } else {
      message.error(res.data.message || '生成自愈修复建议失败')
    }
  } catch (error) {
    console.error('生成自愈修复建议失败：', error)
    message.error('生成自愈修复建议失败')
  } finally {
    qualityRepairing.value = false
  }
}

const applyQualityRepair = async (attempt: API.SelfHealingAttemptVO) => {
  if (!attempt.id) return
  qualityRepairApplying.value = true
  try {
    const res = await applySelfHealingAttempt({ attemptId: attempt.id })
    if (res.data.code === 0 && res.data.data) {
      message.success('自愈补丁已应用，已触发重新构建')
      if (qualityTask.value?.id) {
        await loadQualityDetails(qualityTask.value.id)
      }
      await fetchAppInfo()
    } else {
      message.error(res.data.message || '应用自愈补丁失败')
    }
  } catch (error) {
    console.error('应用自愈补丁失败：', error)
    message.error('应用自愈补丁失败')
  } finally {
    qualityRepairApplying.value = false
  }
}

const loadAppVersions = async () => {
  if (!appId.value) return
  versionLoading.value = true
  try {
    const res = await listAppVersions({ appId: appId.value as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appVersions.value = res.data.data
    } else {
      message.error('加载版本历史失败：' + res.data.message)
    }
  } catch (error) {
    console.error('加载版本历史失败：', error)
    message.error('加载版本历史失败')
  } finally {
    versionLoading.value = false
  }
}

const openVersionDrawer = async () => {
  versionDrawerVisible.value = true
  await loadAppVersions()
}

const handleVersionDrawerOpenChange = (open: boolean) => {
  if (open) {
    loadAppVersions()
  }
}

const confirmRollback = (version: API.AppVersionVO) => {
  if (!version.commitId || !appId.value) {
    message.error('版本 commit 不存在')
    return
  }
  Modal.confirm({
    title: '确认回滚版本？',
    content: `将代码回滚到第 ${version.roundNo} 轮 (${version.shortCommitId || version.commitId})，回滚后会自动触发构建任务。`,
    okText: '确认回滚',
    cancelText: '取消',
    okButtonProps: { danger: true },
    async onOk() {
      versionRollingBack.value = true
      try {
        const res = await rollbackAppVersion({
          appId: appId.value as unknown as number,
          commitId: version.commitId,
          reason: `Rollback to round ${version.roundNo}`,
        })
        if (res.data.code === 0 && res.data.data) {
          const rollbackResult = res.data.data
          message.success('已回滚，构建任务已进入队列')
          buildTaskId.value = rollbackResult.buildTaskId
          buildStatus.value = rollbackResult.status || 'QUEUED'
          buildError.value = ''
          buildLogs.value = []
          if (rollbackResult.buildTaskId) {
            startBuildPolling(rollbackResult.buildTaskId)
          }
          await loadAppVersions()
        } else {
          message.error('回滚失败：' + res.data.message)
        }
      } catch (error) {
        console.error('回滚失败：', error)
        message.error('回滚失败')
      } finally {
        versionRollingBack.value = false
      }
    },
  })
}

const deployApp = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  deploying.value = true
  try {
    const res = await deployAppApi({
      appId: appId.value as unknown as number,
    })

    if (res.data.code === 0 && res.data.data) {
      const task = res.data.data
      buildTaskId.value = task.taskId
      buildStatus.value = task.status || 'QUEUED'
      buildError.value = ''
      buildLogs.value = []
      if (task.taskId) {
        startBuildPolling(task.taskId)
      }
      message.success('构建任务已进入队列')
    } else {
      message.error('部署失败：' + res.data.message)
    }
  } catch (error) {
    console.error('部署失败：', error)
    message.error('部署失败，请重试')
  } finally {
    deploying.value = false
  }
}

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 打开部署的网站
const openDeployedSite = () => {
  if (deployUrl.value) {
    window.open(deployUrl.value, '_blank')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  previewReady.value = true
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (iframe) {
    visualEditor.init(iframe)
    visualEditor.onIframeLoad()
  }
}

// 编辑应用
const editApp = () => {
  if (appInfo.value?.id) {
    router.push(`/app/edit/${appInfo.value.id}`)
  }
}

// 删除应用
const deleteApp = async () => {
  if (!appInfo.value?.id) return

  try {
    const res = await deleteAppApi({ id: appInfo.value.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      appDetailVisible.value = false
      router.push('/')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    console.error('删除失败：', error)
    message.error('删除失败')
  }
}

// 可视化编辑相关函数
const toggleEditMode = () => {
  // 检查 iframe 是否已经加载
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (!iframe) {
    message.warning('请等待页面加载完成')
    return
  }
  // 确保 visualEditor 已初始化
  if (!previewReady.value) {
    message.warning('请等待页面加载完成')
    return
  }
  const newEditMode = visualEditor.toggleEditMode()
  isEditMode.value = newEditMode
}

const clearSelectedElement = () => {
  selectedElementInfo.value = null
  visualPatch.value = undefined
  visualEditor.clearSelection()
}

const buildVisualChangeSet = (draft: API.VisualEditDraft): API.VisualEditChangeSet => {
  const inlineStyle: Record<string, string> = {}
  if (draft.color?.trim()) inlineStyle.color = draft.color.trim()
  if (draft.backgroundColor?.trim()) inlineStyle['background-color'] = draft.backgroundColor.trim()
  if (draft.fontSize?.trim()) inlineStyle['font-size'] = draft.fontSize.trim()
  if (draft.borderRadius?.trim()) inlineStyle['border-radius'] = draft.borderRadius.trim()
  return {
    textContent: draft.textContent?.trim(),
    className: draft.className?.trim(),
    inlineStyle: Object.keys(inlineStyle).length ? inlineStyle : undefined,
  }
}

const previewVisualPatch = async (draft: API.VisualEditDraft) => {
  if (!selectedElementInfo.value || !appId.value) {
    message.warning('请先在预览区选中一个元素')
    return
  }
  visualPatchPreviewing.value = true
  try {
    const res = await previewVisualEdit({
      appId: appId.value as unknown as number,
      element: selectedElementInfo.value,
      changes: buildVisualChangeSet(draft),
      instruction: draft.instruction,
    })
    if (res.data.code === 0 && res.data.data?.patch) {
      visualPatch.value = res.data.data.patch
      if (res.data.data.patch.applicable) {
        message.success('差异预览已生成')
      } else {
        message.warning(res.data.data.patch.message || 'No patch generated')
      }
    } else {
      message.error(res.data.message || '生成可视化差异预览失败')
    }
  } catch (error) {
    console.error('Preview visual edit failed:', error)
    message.error('生成可视化差异预览失败')
  } finally {
    visualPatchPreviewing.value = false
  }
}

const applyVisualPatch = async (draft: API.VisualEditDraft) => {
  if (!visualPatch.value?.applicable || !appId.value) {
    message.warning('请先生成有效的差异预览')
    return
  }
  const doApply = async () => {
    visualPatchApplying.value = true
    try {
      const res = await applyVisualEdit({
        appId: appId.value as unknown as number,
        patch: visualPatch.value,
        summary: draft.instruction || `Visual edit: ${selectedElementInfo.value?.selector || ''}`,
      })
      if (res.data.code === 0 && res.data.data) {
        const task = res.data.data.buildTask
        message.success('可视化补丁已应用')
        if (task?.taskId) {
          buildTaskId.value = task.taskId
          buildStatus.value = task.status || 'QUEUED'
          buildLogs.value = []
          startBuildPolling(task.taskId)
        }
        clearSelectedElement()
        await openVersionDrawer()
      } else {
        message.error(res.data.message || '应用可视化补丁失败')
      }
    } catch (error) {
      console.error('Apply visual edit failed:', error)
      message.error('应用可视化补丁失败')
    } finally {
      visualPatchApplying.value = false
    }
  }
  if (visualPatch.value.requiresConfirmation) {
    Modal.confirm({
      title: '确认应用可视化补丁',
      content: '检测到多个相近的源码位置，请先确认当前差异就是你想修改的位置。',
      onOk: doApply,
    })
    return
  }
  await doApply()
}

const getInputPlaceholder = () => {
  if (selectedElementInfo.value) {
    return `正在编辑 ${selectedElementInfo.value.tagName.toLowerCase()} 元素，描述您想要的修改...`
  }
  return '请描述你想生成的网站，越详细效果越好哦'
}

// 页面加载时获取应用信息
onMounted(() => {
  fetchAppInfo()
  loadLatestQualityReport()

  // 监听 iframe 消息
  window.addEventListener('message', (event) => {
    visualEditor.handleIframeMessage(event)
  })
})

// 清理资源
onUnmounted(() => {
  activeEventSource.value?.close()
  clearBuildPolling()
  clearQualityPolling()
})
</script>

<style scoped>
#appChatPage {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fdfdfd;
}

/* 顶部栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-gen-type-tag {
  font-size: 12px;
}

.app-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 8px;
  overflow: hidden;
}

/* 左侧对话区域 */
.chat-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.messages-container {
  flex: 0.9;
  padding: 16px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-item {
  margin-bottom: 12px;
}

.user-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 8px;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user-message .message-content {
  background: #1890ff;
  color: white;
}

.ai-message .message-content {
  background: #f5f5f5;
  color: #1a1a1a;
  padding: 8px 12px;
}

.message-avatar {
  flex-shrink: 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.streaming-content {
  max-height: 420px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* 加载更多按钮 */
.load-more-container {
  text-align: center;
  padding: 8px 0;
  margin-bottom: 16px;
}

.agent-timeline {
  flex: 0 0 190px;
  margin: 0 16px 8px;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow-y: auto;
  background: #ffffff;
}

.agent-timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

.agent-timeline-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agent-timeline-item {
  padding: 7px 8px;
  border-left: 3px solid #d9d9d9;
  background: #fafafa;
  border-radius: 6px;
}

.agent-status {
  border-left-color: #1677ff;
}

.agent-tool {
  border-left-color: #13c2c2;
}

.agent-diff {
  border-left-color: #722ed1;
}

.agent-error {
  border-left-color: #ff4d4f;
}

.agent-done {
  border-left-color: #52c41a;
}

.agent-timeline-main {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.agent-timeline-kind {
  color: #666;
  text-transform: uppercase;
}

.agent-timeline-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f1f1f;
}

.agent-timeline-time {
  color: #999;
  font-size: 11px;
}

.agent-timeline-detail {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-word;
}

.agent-diff-content {
  max-height: 220px;
  margin: 0;
  padding: 8px;
  overflow: auto;
  background: #f6f8fa;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}

/* 输入区域 */
.input-container {
  padding: 16px;
  background: white;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .ant-input {
  padding-right: 50px;
}

.input-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

/* 右侧预览区域 */
.preview-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.sandbox-hint {
  padding: 0 16px 10px;
  color: #8c8c8c;
  font-size: 12px;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.preview-loading p {
  margin-top: 16px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.build-progress-panel {
  margin: 0 16px 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
}

.build-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.build-title {
  margin-right: 8px;
  font-weight: 600;
}

.build-task-id {
  color: #8c8c8c;
  font-size: 12px;
}

.build-error {
  margin-top: 8px;
  color: #ff4d4f;
}

.build-log-list {
  max-height: 220px;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.build-log-line {
  display: flex;
  gap: 8px;
  white-space: pre-wrap;
}

.build-log-type {
  min-width: 56px;
  color: #1677ff;
}

.build-log-content {
  flex: 1;
  word-break: break-word;
}

.selected-element-alert {
  margin: 0 16px;
}

/* 响应式设计 */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-item {
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
}

.version-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.version-round {
  margin-right: 8px;
  font-weight: 600;
}

.version-commit {
  color: #1677ff;
  font-size: 12px;
}

.version-summary {
  margin-top: 8px;
  color: #262626;
  line-height: 1.5;
  word-break: break-word;
}

.version-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 12px;
}

.version-actions {
  margin-top: 12px;
  text-align: right;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .chat-section,
  .preview-section {
    flex: none;
    height: 50vh;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 12px 16px;
  }

  .app-name {
    font-size: 16px;
  }

  .main-content {
    padding: 8px;
    gap: 8px;
  }

  .message-content {
    max-width: 85%;
  }

  /* 选中元素信息样式 */
  .selected-element-alert {
    margin: 0 16px;
  }

  .selected-element-info {
    line-height: 1.4;
  }

  .element-header {
    margin-bottom: 8px;
  }

  .element-details {
    margin-top: 8px;
  }

  .element-item {
    margin-bottom: 4px;
    font-size: 13px;
  }

  .element-item:last-child {
    margin-bottom: 0;
  }

  .element-tag {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #007bff;
  }

  .element-id {
    color: #28a745;
    margin-left: 4px;
  }

  .element-class {
    color: #ffc107;
    margin-left: 4px;
  }

  .element-selector-code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: #f6f8fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 12px;
    color: #d73a49;
    border: 1px solid #e1e4e8;
  }

  /* 编辑模式按钮样式 */
  .edit-mode-active {
    background-color: #52c41a !important;
    border-color: #52c41a !important;
    color: white !important;
  }

  .edit-mode-active:hover {
    background-color: #73d13d !important;
    border-color: #73d13d !important;
  }
}
</style>
