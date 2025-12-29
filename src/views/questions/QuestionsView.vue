<template>
  <div class="grid">
    <div class="col-12">
      <!-- Header -->
      <div class="card mb-4">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0 mb-2">
              Banco de Preguntas
            </h1>
            <p class="text-muted-color m-0">Gestiona todas tus preguntas desde un solo lugar</p>
          </div>
          <Button
            label="Crear Pregunta"
            icon="pi pi-plus"
            @click="createQuestion"
            class="p-button-primary"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="field">
              <label
                for="search"
                class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
              >
                Buscar
              </label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search" />
                <InputText
                  id="search"
                  v-model="filters.search"
                  placeholder="Buscar por texto..."
                  class="w-full"
                  @input="onFilterChange"
                />
              </span>
            </div>
          </div>

          <div class="col-12 md:col-3">
            <div class="field">
              <label for="type" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                Tipo de Pregunta
              </label>
              <Select
                id="type"
                v-model="filters.type"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todos los tipos"
                class="w-full"
                @change="onFilterChange"
              />
            </div>
          </div>

          <div class="col-12 md:col-3">
            <div class="field">
              <label
                for="difficulty"
                class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
              >
                Dificultad
              </label>
              <Select
                id="difficulty"
                v-model="filters.difficulty"
                :options="difficultyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todas las dificultades"
                class="w-full"
                @change="onFilterChange"
              />
            </div>
          </div>

          <div class="col-12 md:col-2">
            <div class="field">
              <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                &nbsp;
              </label>
              <Button
                label="Limpiar"
                icon="pi pi-filter-slash"
                @click="clearFilters"
                class="w-full p-button-outlined"
                severity="secondary"
              />
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div
          class="flex flex-wrap gap-4 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700"
        >
          <div class="flex items-center gap-2">
            <i class="pi pi-question-circle text-primary"></i>
            <span class="text-muted-color">Total:</span>
            <span class="font-semibold text-surface-900 dark:text-surface-0">{{
              filteredQuestions.length
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="pi pi-star text-warning"></i>
            <span class="text-muted-color">Puntos totales:</span>
            <span class="font-semibold text-surface-900 dark:text-surface-0">{{
              totalPoints
            }}</span>
          </div>
        </div>
      </div>

      <!-- Questions Table -->
      <div class="card">
        <DataTable
          :value="filteredQuestions"
          :loading="questionStore.isLoading"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsiveLayout="scroll"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} preguntas"
          :emptyMessage="
            questionStore.error ? 'Error al cargar preguntas' : 'No se encontraron preguntas'
          "
          stripedRows
          class="p-datatable-sm"
        >
          <Column field="id" header="ID" style="width: 5%" sortable>
            <template #body="slotProps">
              <Tag :value="slotProps.data.id" severity="secondary" />
            </template>
          </Column>

          <Column field="text" header="Pregunta" style="width: 40%" sortable>
            <template #body="slotProps">
              <div
                class="question-text-preview"
                v-html="slotProps.data.text"
                :title="stripHtml(slotProps.data.text)"
              ></div>
            </template>
          </Column>

          <Column field="type" header="Tipo" style="width: 15%" sortable>
            <template #body="slotProps">
              <Tag
                :value="getQuestionTypeLabel(slotProps.data.type)"
                :severity="getQuestionTypeSeverity(slotProps.data.type)"
                icon="pi pi-question-circle"
              />
            </template>
          </Column>

          <Column field="points" header="Puntos" style="width: 10%" sortable>
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-star text-warning"></i>
                <span class="font-semibold">{{ slotProps.data.points }}</span>
              </div>
            </template>
          </Column>

          <Column field="meta.difficulty" header="Dificultad" style="width: 15%" sortable>
            <template #body="slotProps">
              <Tag
                v-if="slotProps.data.meta?.difficulty"
                :value="getDifficultyLabel(slotProps.data.meta.difficulty)"
                :severity="getDifficultySeverity(slotProps.data.meta.difficulty)"
              />
              <span v-else class="text-muted-color">-</span>
            </template>
          </Column>

          <Column field="exam" header="Examen" style="width: 15%">
            <template #body="slotProps">
              <div v-if="slotProps.data.exam" class="flex items-center gap-2">
                <i class="pi pi-file text-primary"></i>
                <span class="text-sm">{{ slotProps.data.exam.title }}</span>
              </div>
              <span v-else class="text-muted-color text-sm">Sin asignar</span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 10%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  @click="viewQuestion(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Ver detalle'"
                />
                <Button
                  icon="pi pi-pencil"
                  @click="editQuestion(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Editar'"
                />
                <Button
                  icon="pi pi-trash"
                  @click="confirmDelete(slotProps.data.id, slotProps.data.text)"
                  class="p-button-rounded p-button-text p-button-danger p-button-sm"
                  v-tooltip.top="'Eliminar'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Empty State -->
      <div
        v-if="!questionStore.isLoading && filteredQuestions.length === 0"
        class="card text-center py-8"
      >
        <i class="pi pi-question-circle text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          {{
            filters.search || filters.type || filters.difficulty
              ? 'No se encontraron preguntas'
              : 'No hay preguntas'
          }}
        </h3>
        <p class="text-muted-color mb-4">
          {{
            filters.search || filters.type || filters.difficulty
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea tu primera pregunta para comenzar a construir tu banco de preguntas'
          }}
        </p>
        <Button
          v-if="!filters.search && !filters.type && !filters.difficulty"
          label="Crear Primera Pregunta"
          icon="pi pi-plus"
          @click="createQuestion"
          class="p-button-primary"
        />
        <Button
          v-else
          label="Limpiar Filtros"
          icon="pi pi-filter-slash"
          @click="clearFilters"
          class="p-button-outlined"
        />
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

// Components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ConfirmDialog from 'primevue/confirmdialog'

// Composables
const router = useRouter()
const questionStore = useQuestionStore()
const confirm = useConfirm()
const toast = useToast()

// State
const filters = ref({
  search: '',
  type: null as string | null,
  difficulty: null as string | null,
})

// Options
const typeOptions = [
  { label: 'Todos los tipos', value: null },
  { label: 'Opción Múltiple', value: 'multiple_choice' },
  { label: 'Verdadero/Falso', value: 'true_false' },
  { label: 'Respuesta Abierta', value: 'open' },
]

const difficultyOptions = [
  { label: 'Todas las dificultades', value: null },
  { label: 'Fácil', value: 'easy' },
  { label: 'Medio', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
]

// Computed
const filteredQuestions = computed(() => {
  let questions = questionStore.questions

  // Filter by search
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    questions = questions.filter(
      (q) =>
        stripHtml(q.text).toLowerCase().includes(searchLower) ||
        q.id.toString().includes(searchLower),
    )
  }

  // Filter by type
  if (filters.value.type) {
    questions = questions.filter((q) => q.type === filters.value.type)
  }

  // Filter by difficulty
  if (filters.value.difficulty) {
    questions = questions.filter((q) => q.meta?.difficulty === filters.value.difficulty)
  }

  return questions
})

const totalPoints = computed(() => {
  return filteredQuestions.value.reduce((total, question) => total + (question.points || 0), 0)
})

// Methods
const loadQuestions = async () => {
  try {
    await questionStore.fetchQuestions()
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al cargar las preguntas',
      life: 5000,
    })
  }
}

const stripHtml = (html: string): string => {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const onFilterChange = () => {
  // Filters are reactive, no need to do anything
}

const clearFilters = () => {
  filters.value = {
    search: '',
    type: null,
    difficulty: null,
  }
}

const createQuestion = () => {
  router.push('/questions/create')
}

const viewQuestion = (id: number) => {
  router.push(`/questions/${id}`)
}

const editQuestion = (id: number) => {
  router.push(`/questions/${id}/edit`)
}

const confirmDelete = (id: number, questionText: string) => {
  const _textPreview = stripHtml(questionText).substring(0, 50) + '...'

  confirm.require({
    message: `¿Estás seguro de que quieres eliminar esta pregunta?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await questionStore.deleteQuestion(id)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pregunta eliminada correctamente',
          life: 3000,
        })
      } catch (err: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error al eliminar la pregunta',
          life: 5000,
        })
      }
    },
  })
}

// Utility functions
const getQuestionTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    multiple_choice: 'Opción múltiple',
    true_false: 'Verdadero/Falso',
    open: 'Respuesta abierta',
  }
  return types[type] || type
}

const getQuestionTypeSeverity = (type: string) => {
  const severities: Record<string, string> = {
    multiple_choice: 'info',
    true_false: 'success',
    open: 'warning',
  }
  return severities[type] || 'secondary'
}

const getDifficultyLabel = (difficulty?: string) => {
  if (!difficulty) return 'No especificada'
  const labels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
  }
  return labels[difficulty] || difficulty
}

const getDifficultySeverity = (difficulty?: string) => {
  if (!difficulty) return 'secondary'
  const severities: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
  }
  return severities[difficulty] || 'secondary'
}

// Lifecycle
onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.question-text-preview {
  line-height: 1.5;
  max-height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-text-preview :deep(p) {
  margin: 0;
  display: inline;
}

.question-text-preview :deep(strong) {
  font-weight: 600;
}
</style>
