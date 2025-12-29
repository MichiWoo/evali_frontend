<template>
  <Dialog
    v-model:visible="visible"
    header="Exportar Usuarios"
    :modal="true"
    :style="{ width: '600px' }"
    :closable="!isExporting"
    class="export-modal"
  >
    <div class="export-content">
      <!-- Formato de exportación -->
      <div class="form-section">
        <label for="export-format" class="form-label">Formato de exportación</label>
        <Select
          id="export-format"
          v-model="exportFormat"
          :options="formatOptions"
          option-label="label"
          option-value="value"
          placeholder="Seleccionar formato"
          class="w-full"
        />
      </div>

      <!-- Filtros de exportación -->
      <div class="form-section">
        <h4 class="section-title">Filtros de exportación</h4>

        <div class="filters-grid">
          <!-- Rol -->
          <div class="filter-item">
            <label for="export-role" class="form-label">Rol</label>
            <Select
              id="export-role"
              v-model="filters.role"
              :options="roleOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos los roles"
              show-clear
              class="w-full"
            />
          </div>

          <!-- Estado -->
          <div class="filter-item">
            <label for="export-status" class="form-label">Estado</label>
            <Select
              id="export-status"
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos los estados"
              show-clear
              class="w-full"
            />
          </div>

          <!-- Búsqueda -->
          <div class="filter-item full-width">
            <label for="export-search" class="form-label">Búsqueda</label>
            <InputText
              id="export-search"
              v-model="filters.search"
              placeholder="Buscar por nombre o email..."
              class="w-full"
            />
          </div>

          <!-- Ordenamiento -->
          <div class="filter-item">
            <label for="export-sort" class="form-label">Ordenar por</label>
            <Select
              id="export-sort"
              v-model="filters.sort"
              :options="sortOptions"
              option-label="label"
              option-value="value"
              placeholder="Campo de ordenamiento"
              class="w-full"
            />
          </div>

          <div class="filter-item">
            <label for="export-order" class="form-label">Dirección</label>
            <Select
              id="export-order"
              v-model="filters.order"
              :options="orderOptions"
              option-label="label"
              option-value="value"
              placeholder="Dirección"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Información de exportación -->
      <div class="info-section">
        <div class="info-header">
          <i class="pi pi-info-circle"></i>
          <span class="info-title">Información de exportación</span>
        </div>
        <div class="info-content">
          <p>• Se exportarán todos los usuarios que coincidan con los filtros aplicados</p>
          <p>• El archivo se descargará automáticamente</p>
          <p>• Los datos incluyen: ID, Nombre, Email, Roles, Estado y Fechas</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="cancelExport"
          :disabled="isExporting"
        />
        <Button
          label="Exportar"
          icon="pi pi-download"
          @click="confirmExport"
          :loading="isExporting"
          :disabled="isExporting || !exportFormat"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'

// Props
interface Props {
  visible: boolean
  isExporting: boolean
  currentFilters?: {
    search?: string
    role?: string
    status?: string
    sort?: string
    order?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  isExporting: false,
  currentFilters: () => ({}),
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  export: [filters: any]
}>()

// State
const exportFormat = ref('xlsx')
const filters = ref({
  role: null,
  status: null,
  search: '',
  sort: 'created_at',
  order: 'desc',
})

// Options
const formatOptions = ref([
  { label: 'Excel (.xlsx)', value: 'xlsx' },
  { label: 'CSV (.csv)', value: 'csv' },
  { label: 'PDF (.pdf)', value: 'pdf' },
])

const roleOptions = ref([
  { label: 'Administrador', value: 'admin' },
  { label: 'Profesor', value: 'teacher' },
  { label: 'Estudiante', value: 'student' },
])

const statusOptions = ref([
  { label: 'Verificado', value: 'verified' },
  { label: 'Pendiente', value: 'pending' },
])

const sortOptions = ref([
  { label: 'Fecha de creación', value: 'created_at' },
  { label: 'Nombre', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Última actualización', value: 'updated_at' },
])

const orderOptions = ref([
  { label: 'Ascendente', value: 'asc' },
  { label: 'Descendente', value: 'desc' },
])

// Computed
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// Methods
const confirmExport = () => {
  if (!exportFormat.value) {
    return
  }

  const exportFilters = {
    format: exportFormat.value,
    ...filters.value,
  }

  // Filtrar valores vacíos
  Object.keys(exportFilters).forEach((key) => {
    if (exportFilters[key] === '' || exportFilters[key] === null) {
      delete exportFilters[key]
    }
  })

  emit('export', exportFilters)
}

const cancelExport = () => {
  visible.value = false
  resetFilters()
}

const resetFilters = () => {
  filters.value = {
    role: null,
    status: null,
    search: '',
    sort: 'created_at',
    order: 'desc',
  }
  exportFormat.value = 'xlsx'
}

// Watch for current filters changes
watch(
  () => props.currentFilters,
  (newFilters) => {
    if (newFilters) {
      filters.value = {
        role: newFilters.role || null,
        status: newFilters.status || null,
        search: newFilters.search || '',
        sort: newFilters.sort || 'created_at',
        order: newFilters.order || 'desc',
      }
    }
  },
  { immediate: true },
)

// Watch for dialog visibility
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetFilters()
  }
})
</script>

<style scoped>
/* Modal Layout */
.export-modal :deep(.p-dialog) {
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.export-modal :deep(.p-dialog-header) {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-radius: 12px 12px 0 0;
}

.export-modal :deep(.p-dialog-content) {
  padding: 1.5rem;
  background: var(--surface-card);
}

.export-modal :deep(.p-dialog-footer) {
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-radius: 0 0 12px 12px;
}

/* Content Layout */
.export-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

/* Form Labels */
.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Filters Grid */
.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item.full-width {
  grid-column: 1 / -1;
}

/* Info Section */
.info-section {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.info-header i {
  color: #0284c7;
  font-size: 1rem;
}

.info-title {
  font-weight: 600;
  color: #0c4a6e;
  font-size: 0.875rem;
}

.info-content {
  color: #075985;
  font-size: 0.875rem;
  line-height: 1.5;
}

.info-content p {
  margin: 0 0 0.25rem 0;
}

.info-content p:last-child {
  margin-bottom: 0;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

/* Responsive Design */
@media (max-width: 640px) {
  .export-modal :deep(.p-dialog) {
    width: 95vw !important;
    max-width: 95vw;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer .p-button {
    width: 100%;
  }
}

/* Select Component Fixes */
.export-modal :deep(.p-select) {
  width: 100%;
}

.export-modal :deep(.p-select .p-select-label) {
  padding: 0.75rem;
  border-radius: 6px;
}

.export-modal :deep(.p-select .p-select-trigger) {
  border-radius: 6px;
}

/* Input Text Fixes */
.export-modal :deep(.p-inputtext) {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
}

/* Button Styles */
.export-modal :deep(.p-button) {
  border-radius: 6px;
  font-weight: 500;
}

.export-modal :deep(.p-button.p-button-outlined) {
  border-width: 1px;
}
</style>
