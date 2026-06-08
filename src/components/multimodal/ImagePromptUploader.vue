<template>
  <div class="image-prompt-uploader">
    <a-upload
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :disabled="uploading || disabled"
      accept="image/png,image/jpeg,image/webp"
    >
      <div v-if="!image" class="upload-drop">
        <div class="upload-icon">
          <CloudUploadOutlined />
        </div>
        <div class="upload-main">上传参考图</div>
        <div class="upload-sub">PNG / JPEG / WebP，最大 8MB</div>
      </div>
      <a-button v-else size="small" :loading="uploading" :disabled="disabled">
        <template #icon>
          <ReloadOutlined />
        </template>
        重新上传
      </a-button>
    </a-upload>

    <a-card v-if="image" class="image-card" size="small" :body-style="{ padding: '8px' }">
      <div class="image-card-body">
        <a-image
          :src="image.previewUrl"
          :width="56"
          :height="56"
          :preview="{ mask: '预览' }"
          class="image-thumb"
        />
        <div class="image-meta">
          <div class="image-name">{{ image.originalName || '参考图' }}</div>
          <div class="image-sub">{{ image.mimeType || 'image' }} · {{ formatSize(image.fileSize) }}</div>
          <div v-if="image.width && image.height" class="image-sub">
            {{ image.width }} × {{ image.height }}
          </div>
        </div>
        <a-tooltip title="移除参考图">
          <a-button type="text" danger size="small" @click="removeImage" :disabled="disabled">
            <template #icon>
              <DeleteOutlined />
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { CloudUploadOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { uploadMultimodalImage } from '@/api/appController'

const props = defineProps<{
  appId?: number | string
  disabled?: boolean
}>()

const emit = defineEmits<{
  uploaded: [image: API.ReferenceImageUploadVO]
  removed: []
}>()

const image = defineModel<API.ReferenceImageUploadVO | undefined>('image')
const uploading = ref(false)

const beforeUpload = async (file: File) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowed.includes(file.type)) {
    message.warning('仅支持 PNG、JPEG、WebP 参考图')
    return false
  }
  if (file.size > 8 * 1024 * 1024) {
    message.warning('参考图不能超过 8MB')
    return false
  }
  uploading.value = true
  try {
    const res = await uploadMultimodalImage(file, props.appId)
    if (res.data.code === 0 && res.data.data) {
      image.value = res.data.data
      emit('uploaded', res.data.data)
      message.success('参考图上传成功')
    } else {
      message.error(res.data.message || '参考图上传失败')
    }
  } catch (error) {
    console.error('参考图上传失败', error)
    message.error('参考图上传失败')
  } finally {
    uploading.value = false
  }
  return false
}

const removeImage = () => {
  image.value = undefined
  emit('removed')
}

const formatSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.image-prompt-uploader {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-drop {
  width: 180px;
  min-height: 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px dashed #91caff;
  border-radius: 8px;
  background: #f0f7ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-drop:hover {
  border-color: #1677ff;
  background: #e6f4ff;
}

.upload-icon {
  color: #1677ff;
  font-size: 22px;
  line-height: 1;
}

.upload-main {
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
}

.upload-sub {
  color: #64748b;
  font-size: 12px;
}

.image-card {
  width: min(360px, 100%);
  border-radius: 8px;
}

.image-card-body {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.image-thumb :deep(img) {
  object-fit: cover;
  border-radius: 6px;
}

.image-meta {
  min-width: 0;
}

.image-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
}

.image-sub {
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}
</style>
