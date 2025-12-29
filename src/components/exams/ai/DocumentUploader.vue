<template>
  <div class="document-uploader">
    <div
      class="upload-area"
      :class="{ dragging: isDragging, 'has-file': selectedFile }"
      @drop="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf"
        @change="handleFileSelect"
        class="hidden-input"
      />

      <div v-if="!selectedFile && !uploading" class="upload-placeholder">
        <i class="pi pi-cloud-upload text-6xl text-primary mb-4"></i>
        <p class="text-lg font-semibold mb-2">Arrastra tu PDF aquí</p>
        <p class="text-muted-color mb-4">o haz clic para seleccionar</p>
        <p class="text-sm text-muted-color">Máximo 10MB</p>
      </div>

      <div v-if="selectedFile && !uploading" class="file-selected">
        <i class="pi pi-file-pdf text-4xl text-red-500 mb-2"></i>
        <p class="font-semibold">{{ selectedFile.name }}</p>
        <p class="text-sm text-muted-color">{{ formatFileSize(selectedFile.size) }}</p>
        <Button
          label="Cambiar archivo"
          icon="pi pi-times"
          text
          size="small"
          @click.stop="clearFile"
          class="mt-2"
        />
      </div>

      <div v-if="uploading" class="uploading">
        <ProgressSpinner />
        <p class="mt-3">Subiendo documento...</p>
      </div>
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mt-3">
      {{ error }}
    </Message>

    <Message v-if="uploadSuccess" severity="success" :closable="false" class="mt-3">
      Documento subido exitosamente. Procesando...
    </Message>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import type { DocumentUpload } from '@/types'
import { useAIExamGenerationStore } from '@/stores/aiExamGeneration'

const emit = defineEmits<{
  (e: 'uploaded', document: DocumentUpload): void
}>()

const aiStore = useAIExamGenerationStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const uploadSuccess = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0])
  }
}

const processFile = (file: File) => {
  // Validar tipo
  if (file.type !== 'application/pdf') {
    error.value = 'Solo se permiten archivos PDF'
    return
  }

  // Validar tamaño (10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'El archivo excede el tamaño máximo de 10MB'
    return
  }

  error.value = null
  selectedFile.value = file
  uploadFile(file)
}

const uploadFile = async (file: File) => {
  try {
    uploading.value = true
    error.value = null
    uploadSuccess.value = false

    const document = await aiStore.uploadDocument(file)

    uploadSuccess.value = true
    emit('uploaded', document)

    // Limpiar después de 3 segundos
    setTimeout(() => {
      clearFile()
      uploadSuccess.value = false
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Error al subir el archivo'
    selectedFile.value = null
  } finally {
    uploading.value = false
  }
}

const clearFile = () => {
  selectedFile.value = null
  error.value = null
  uploadSuccess.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.document-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed var(--p-color-border);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--p-color-surface);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: var(--p-primary-color);
  background: var(--p-color-surface-hover);
}

.upload-area.dragging {
  border-color: var(--p-primary-color);
  background: var(--p-color-primary-50);
}

.upload-area.has-file {
  border-color: var(--p-color-success);
  background: var(--p-color-success-50);
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
