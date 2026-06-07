declare namespace API {
  type AppAddRequest = {
    initPrompt?: string
  }

  type AppAdminUpdateRequest = {
    id?: number
    appName?: string
    cover?: string
    priority?: number
  }

  type AppDeployRequest = {
    appId?: number
  }

  type AppVersionRollbackRequest = {
    appId?: number
    commitId?: string
    reason?: string
  }

  type BuildTaskSubmitRequest = {
    appId?: number
    triggerType?: string
  }

  type SandboxStartRequest = {
    appId?: number
  }

  type SandboxStopRequest = {
    appId?: number
  }

  type AppQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    priority?: number
    userId?: number
  }

  type AppUpdateRequest = {
    id?: number
    appName?: string
  }

  type AppVO = {
    id?: number
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    deployedTime?: string
    deployStatus?: string
    buildTaskId?: number
    buildErrorMessage?: string
    priority?: number
    userId?: number
    createTime?: string
    updateTime?: string
    user?: UserVO
  }

  type BaseResponseAppVO = {
    code?: number
    data?: AppVO
    message?: string
  }

  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseBuildTaskSubmitVO = {
    code?: number
    data?: BuildTaskSubmitVO
    message?: string
  }

  type BaseResponseBuildTaskVO = {
    code?: number
    data?: BuildTaskVO
    message?: string
  }

  type BaseResponseSandboxStatusResponse = {
    code?: number
    data?: SandboxStatusResponse
    message?: string
  }

  type BaseResponseListBuildLogVO = {
    code?: number
    data?: BuildLogVO[]
    message?: string
  }

  type BaseResponseAppVersionVO = {
    code?: number
    data?: AppVersionVO
    message?: string
  }

  type BaseResponseListAppVersionVO = {
    code?: number
    data?: AppVersionVO[]
    message?: string
  }

  type BaseResponseAppRollbackVO = {
    code?: number
    data?: AppRollbackVO
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponsePageAppVO = {
    code?: number
    data?: PageAppVO
    message?: string
  }

  type BaseResponsePageChatHistory = {
    code?: number
    data?: PageChatHistory
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BuildTaskSubmitVO = {
    taskId?: number
    appId?: number
    status?: string
    deployUrl?: string
    message?: string
  }

  type BuildTaskVO = {
    id?: number
    appId?: number
    userId?: number
    triggerType?: string
    status?: string
    sourceDir?: string
    distDir?: string
    deployKey?: string
    deployUrl?: string
    errorMessage?: string
    queuedTime?: string
    startTime?: string
    finishTime?: string
  }

  type BuildLogVO = {
    id?: number
    taskId?: number
    appId?: number
    logType?: string
    content?: string
    lineNo?: number
    createTime?: string
  }

  type SandboxStatusResponse = {
    appId?: number
    deployKey?: string
    status?: string
    previewUrl?: string
    staticUrl?: string
    errorMessage?: string
  }

  type AppVersionVO = {
    id?: number
    appId?: number
    userId?: number
    roundNo?: number
    commitId?: string
    shortCommitId?: string
    commitMessage?: string
    promptSummary?: string
    codeGenType?: string
    versionType?: string
    rollbackFromCommitId?: string
    buildTaskId?: number
    createTime?: string
  }

  type AppRollbackVO = {
    appId?: number
    targetCommitId?: string
    rollbackVersionId?: number
    buildTaskId?: number
    status?: string
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type ChatHistory = {
    id?: number
    message?: string
    messageType?: string
    appId?: number
    userId?: number
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type ChatHistoryQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    message?: string
    messageType?: string
    appId?: number
    userId?: number
    lastCreateTime?: string
  }

  type chatToGenCodeParams = {
    appId: number
    message: string
  }

  type DeleteRequest = {
    id?: number
  }

  type downloadAppCodeParams = {
    appId: number
  }

  type getAppVOByIdByAdminParams = {
    id: number
  }

  type getAppVoByIdParams = {
    id: number
  }

  type getInfoParams = {
    id: number
  }

  type getUserByIdParams = {
    id: number
  }

  type getUserVoByIdParams = {
    id: number
  }

  type listAppChatHistoryParams = {
    appId: number
    pageSize?: number
    lastCreateTime?: string
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
  }

  type PageAppVO = {
    records?: AppVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageChatHistory = {
    records?: ChatHistory[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type pageParams = {
    page: PageChatHistory
  }

  type PageUserVO = {
    records?: UserVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type removeParams = {
    id: number
  }

  type ServerSentEventString = true

  type serveStaticResourceParams = {
    deployKey: string
  }

  type getBuildTaskParams = {
    taskId: number
  }

  type getSandboxStatusParams = {
    appId: number
  }

  type listBuildLogsParams = {
    taskId: number
    lastId?: number
    pageSize?: number
  }

  type listAppVersionsParams = {
    appId: number
  }

  type getAppVersionParams = {
    versionId: number
  }

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserAddRequest = {
    userName?: string
    userAccount?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
  }

  type UserQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    userAccount?: string
    userPassword?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
  }
}
