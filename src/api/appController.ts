// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /app/add */
export async function addApp(body: API.AppAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/app/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function uploadMultimodalImage(
  file: File,
  appId?: number | string,
  options?: { [key: string]: any }
) {
  const formData = new FormData()
  formData.append('file', file)
  if (appId) {
    formData.append('appId', String(appId))
  }
  return request<API.BaseResponseReferenceImageUploadVO>('/app/multimodal/upload-image', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  })
}

export async function createMultimodalApp(
  body: API.CreateAppWithImageRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/app/multimodal/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function analyzeMultimodalImage(
  params: API.analyzeMultimodalImageParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVisionAnalysisResult>('/app/multimodal/analyze', {
    method: 'POST',
    params: { ...params },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/admin/delete */
export async function deleteAppByAdmin(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/admin/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /app/admin/get/vo */
export async function getAppVoByIdByAdmin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppVOByIdByAdminParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>('/app/admin/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/admin/list/page/vo */
export async function listAppVoByPageByAdmin(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>('/app/admin/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/admin/update */
export async function updateAppByAdmin(
  body: API.AppAdminUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/app/admin/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /app/chat/gen/code */
export async function chatToGenCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.chatToGenCodeParams,
  options?: { [key: string]: any }
) {
  return request<API.ServerSentEventString[]>('/app/chat/gen/code', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/delete */
export async function deleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/deploy */
export async function deployApp(body: API.AppDeployRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBuildTaskSubmitVO>('/app/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function submitBuildTask(
  body: API.BuildTaskSubmitRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBuildTaskSubmitVO>('/app/build/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function getBuildTask(
  params: API.getBuildTaskParams,
  options?: { [key: string]: any }
) {
  const { taskId: param0, ...queryParams } = params
  return request<API.BaseResponseBuildTaskVO>(`/app/build/task/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

export async function listBuildLogs(
  params: API.listBuildLogsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListBuildLogVO>('/app/build/logs', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /app/download/${param0} */
export async function startSandboxPreview(
  body: API.SandboxStartRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSandboxStatusResponse>('/app/sandbox/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function getSandboxStatus(
  params: API.getSandboxStatusParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSandboxStatusResponse>('/app/sandbox/status', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  })
}

export async function stopSandboxPreview(
  body: API.SandboxStopRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSandboxStatusResponse>('/app/sandbox/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function previewVisualEdit(
  body: API.VisualEditPreviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVisualEditPreviewResponse>('/app/visual/edit/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function applyVisualEdit(
  body: API.VisualEditApplyRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVisualEditApplyResponse>('/app/visual/edit/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function listAppVersions(
  params: API.listAppVersionsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListAppVersionVO>('/app/version/list', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  })
}

export async function getAppVersion(
  params: API.getAppVersionParams,
  options?: { [key: string]: any }
) {
  const { versionId: param0, ...queryParams } = params
  return request<API.BaseResponseAppVersionVO>(`/app/version/detail/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

export async function rollbackAppVersion(
  body: API.AppVersionRollbackRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppRollbackVO>('/app/version/rollback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function submitQualityCheck(
  body: API.QualityCheckRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseQualityCheckTaskVO>('/app/quality/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function getQualityTask(
  params: API.getQualityTaskParams,
  options?: { [key: string]: any }
) {
  const { taskId: param0, ...queryParams } = params
  return request<API.BaseResponseQualityCheckTaskVO>(`/app/quality/task/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

export async function listQualityReports(
  params: API.listQualityReportsParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseListQualityCheckReportVO>(`/app/quality/report/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

export async function latestQualityReport(
  params: API.latestQualityReportParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseQualityCheckReportVO>(`/app/quality/report/${param0}/latest`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

export async function listQualityViolations(
  params: API.listQualityViolationsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListDependencyPolicyViolationVO>('/app/quality/violations', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  })
}

export async function createSelfHealingAttempt(
  body: API.QualityRepairRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSelfHealingAttemptVO>('/app/quality/repair', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function applySelfHealingAttempt(
  body: API.QualityRepairApplyRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSelfHealingAttemptVO>('/app/quality/repair/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function listSelfHealingAttempts(
  params: API.listSelfHealingAttemptsParams,
  options?: { [key: string]: any }
) {
  const { taskId: param0, ...queryParams } = params
  return request<API.BaseResponseListSelfHealingAttemptVO>(`/app/quality/repair/attempts/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

export async function downloadAppCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadAppCodeParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<any>(`/app/download/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /app/get/vo */
export async function getAppVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppVoByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>('/app/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/good/list/page/vo */
export async function listGoodAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>('/app/good/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/my/list/page/vo */
export async function listMyAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>('/app/my/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /app/update */
export async function updateApp(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
