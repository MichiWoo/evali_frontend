<template>
  <div class="generation-history">
    <DataTable
      :value="generations"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      emptyMessage="No hay generaciones"
      class="p-datatable-sm"
    >
      <Column field="id" header="ID" :sortable="true" style="width: 80px" />
      <Column field="document_upload.original_filename" header="Documento" :sortable="true">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-file-pdf text-red-500"></i>
            <span>{{ data.document_upload?.original_filename || 'N/A' }}</span>
          </div>
        </template>
      </Column>
      <Column field="exam.title" header="Examen" :sortable="true">
        <template #body="{ data }">
          <span v-if="data.exam">{{ data.exam.title }}</span>
          <span v-else class="text-muted-color">-</span>
        </template>
      </Column>
      <Column field="status" header="Estado" :sortable="true">
        <template #body="{ data }">
          <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
        </template>
      </Column>
      <Column field="created_at" header="Fecha" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.created_at) }}
        </template>
      </Column>
      <Column header="Acciones" style="width: 150px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              text
              rounded
              severity="secondary"
              @click="$emit('view', data)"
              v-tooltip.top="'Ver detalles'"
            />
            <Button
              v-if="data.status === 'completed' && data.exam"
              icon="pi pi-external-link"
              text
              rounded
              severity="info"
              @click="$emit('view-exam', data.exam.id)"
              v-tooltip.top="'Ver examen'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import type { AIExamGeneration } from '@/types'
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

defineProps<{
  generations: AIExamGeneration[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'view', generation: AIExamGeneration): void
  (e: 'view-exam', examId: number): void
}>()

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severities: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
  }
  return severities[status] || 'secondary'
}
</script>

<style scoped>
.generation-history {
  width: 100%;
}
</style>
