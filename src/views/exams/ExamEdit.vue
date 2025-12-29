<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-96">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="card">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else-if="!exam" class="card">
    <Message severity="warn" :closable="false">Examen no encontrado</Message>
  </div>

  <div v-else class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <Button
            icon="pi pi-arrow-left"
            text
            @click="goBack"
            class="p-button-sm"
            v-tooltip.top="'Volver al detalle'"
          />
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">Editar Examen</h1>
        </div>
        <p class="text-muted-color mb-6">Modifica la configuración del examen "{{ exam.title }}"</p>

        <form @submit.prevent="updateExam">
          <div class="grid">
            <!-- Información Básica -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Información Básica
              </h3>
            </div>

            <div class="col-12 lg:col-8">
              <div class="field">
                <label
                  for="title"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Título del Examen <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="title"
                  v-model="formData.title"
                  placeholder="Ingresa el título del examen"
                  class="w-full"
                  :class="{ 'p-invalid': errors.title }"
                  required
                />
                <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
              </div>

              <div class="field">
                <label
                  for="description"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                  >Descripción</label
                >
                <Textarea
                  id="description"
                  v-model="formData.description"
                  placeholder="Describe el propósito y contenido del examen..."
                  rows="4"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Configuración del Examen -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Configuración del Examen
              </h3>
            </div>

            <div class="col-12 lg:col-6">
              <div class="flex flex-row justify-items-stretch items-start gap-4">
                <div class="field">
                  <label
                    for="time_limit"
                    class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                  >
                    Tiempo Límite (minutos)
                  </label>
                  <InputNumber
                    id="time_limit"
                    v-model="formData.duration"
                    :min="1"
                    :max="300"
                    class="w-full"
                    showButtons
                  />
                  <small class="text-muted-color">Vacío = ilimitado</small>
                </div>
                <div class="field">
                  <label
                    for="max_attempts"
                    class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                  >
                    Máximo Intentos
                  </label>
                  <InputNumber
                    id="max_attempts"
                    v-model="formData.max_attempts"
                    :min="1"
                    :max="10"
                    class="w-full"
                    showButtons
                  />
                </div>
              </div>
            </div>

            <!-- Opciones de Configuración -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Opciones Avanzadas
              </h3>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field flex align-items-center">
                <Checkbox
                  id="shuffle_questions"
                  v-model="formData.shuffle_questions"
                  :binary="true"
                />
                <label for="shuffle_questions" class="ml-2 text-surface-900 dark:text-surface-0">
                  Mezclar preguntas
                </label>
              </div>
              <small class="text-muted-color block mb-4">
                Las preguntas aparecerán en orden aleatorio para cada estudiante
              </small>

              <div class="field flex align-items-center">
                <Checkbox id="shuffle_options" v-model="formData.shuffle_options" :binary="true" />
                <label for="shuffle_options" class="ml-2 text-surface-900 dark:text-surface-0">
                  Mezclar opciones de respuesta
                </label>
              </div>
              <small class="text-muted-color block">
                Las opciones de respuesta aparecerán en orden aleatorio
              </small>
            </div>

            <!-- Disponibilidad del Examen -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Disponibilidad
              </h3>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label
                  for="start_date"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Fecha de Inicio
                </label>
                <DatePicker
                  id="start_date"
                  v-model="formData.start_date"
                  placeholder="Selecciona fecha de inicio"
                  :showTime="true"
                  :showIcon="true"
                  class="w-full"
                />
                <small class="text-muted-color">
                  Deja vacío para que esté disponible inmediatamente
                </small>
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label
                  for="end_date"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Fecha de Finalización
                </label>
                <DatePicker
                  id="end_date"
                  v-model="formData.end_date"
                  placeholder="Selecciona fecha de finalización"
                  :showTime="true"
                  :showIcon="true"
                  class="w-full"
                />
                <small class="text-muted-color">
                  Deja vacío para que esté disponible indefinidamente
                </small>
              </div>
            </div>

            <!-- Asignación de Grupos -->
            <div class="col-12 lg:col-6" v-if="availableGroups.length > 0">
              <div class="field">
                <label
                  for="groups"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Asignar a Grupos
                </label>
                <MultiSelect
                  id="groups"
                  v-model="formData.group_ids"
                  :options="availableGroups"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Selecciona los grupos"
                  class="w-full"
                  :filter="true"
                  :maxSelectedLabels="3"
                />
                <small class="text-muted-color">
                  Selecciona los grupos que podrán realizar este examen
                </small>
              </div>
            </div>

            <!-- Información de Estado -->
            <div class="col-12">
              <div class="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div class="flex items-start gap-3">
                  <i class="pi pi-info-circle text-blue-500 text-xl mt-1"></i>
                  <div>
                    <h4 class="text-blue-900 dark:text-blue-100 font-semibold mb-2">
                      Información del Examen
                    </h4>
                    <div class="grid">
                      <div class="col-12 md:col-6">
                        <p class="text-blue-800 dark:text-blue-200 mb-1">
                          <strong>Preguntas:</strong> {{ exam.questions?.length || 0 }}
                        </p>
                        <p class="text-blue-800 dark:text-blue-200 mb-1">
                          <strong>Grupos asignados:</strong> {{ exam.groups?.length || 0 }}
                        </p>
                      </div>
                      <div class="col-12 md:col-6">
                        <p class="text-blue-800 dark:text-blue-200 mb-1">
                          <strong>Creado:</strong> {{ formatDate(exam.created_at) }}
                        </p>
                        <p class="text-blue-800 dark:text-blue-200">
                          <strong>Última actualización:</strong> {{ formatDate(exam.updated_at) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div
            class="flex justify-between items-center mt-6 pt-4 border-t border-surface-200 dark:border-surface-700"
          >
            <div class="flex gap-2">
              <Button label="Cancelar" icon="pi pi-times" outlined @click="goBack" type="button" />
              <Button
                label="Ver Detalle"
                icon="pi pi-eye"
                outlined
                @click="viewDetail"
                type="button"
              />
            </div>

            <div class="flex gap-2">
              <Button
                label="Guardar Cambios"
                icon="pi pi-check"
                :loading="isUpdating"
                type="submit"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exams'
import { useGroupStore } from '@/stores/groups'
import { useToast } from 'primevue/usetoast'
import type { UpdateExamRequest, UpdateExamBackendRequest, Exam } from '@/types'
import { formatDateToLocalISO } from '@/utils/date'

// Components
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'

// Composables
const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const groupStore = useGroupStore()
const toast = useToast()

// State
const examId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const isUpdating = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const availableGroups = ref<any[]>([])

// Form Data
const formData = reactive<UpdateExamRequest>({
  title: '',
  description: '',
  duration: null,
  max_attempts: 1,
  shuffle_questions: false,
  shuffle_options: false,
  start_date: undefined as Date | undefined,
  end_date: undefined as Date | undefined,
  group_ids: [],
})

// Computed
const exam = computed(() => examStore.currentExam)

// Methods
const loadExam = async () => {
  try {
    isLoading.value = true
    error.value = null
    await examStore.fetchExam(examId.value)

    if (exam.value) {
      // Cargar datos del examen en el formulario
      formData.title = exam.value.title
      formData.description = exam.value.description || ''
      formData.duration = exam.value.duration
      formData.max_attempts = exam.value.max_attempts
      formData.shuffle_questions = exam.value.shuffle_questions
      formData.shuffle_options = exam.value.shuffle_options
      formData.start_date = exam.value.start_date ? new Date(exam.value.start_date) : undefined
      formData.end_date = exam.value.end_date ? new Date(exam.value.end_date) : undefined
      formData.group_ids = exam.value.groups?.map((group) => group.id) || []
    }
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el examen'
    console.error('Error loading exam:', err)
  } finally {
    isLoading.value = false
  }
}

const loadGroups = async () => {
  try {
    await groupStore.fetchGroups()
    availableGroups.value = groupStore.groups
  } catch (error) {
    console.error('Error loading groups:', error)
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.title.trim()) {
    errors.value.title = 'El título es obligatorio'
  }

  if (formData.title.trim().length < 3) {
    errors.value.title = 'El título debe tener al menos 3 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const updateExam = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Por favor corrige los errores en el formulario',
    })
    return
  }

  try {
    isUpdating.value = true

    // Separar los datos del examen de los grupos
    const { group_ids, ...examData } = formData

    // Convertir fechas Date a string para el backend (preservando hora local, sin convertir a UTC)
    const examDataForBackend: UpdateExamBackendRequest = {
      ...examData,
      start_date: examData.start_date
        ? examData.start_date instanceof Date
          ? formatDateToLocalISO(examData.start_date)
          : examData.start_date
        : undefined,
      end_date: examData.end_date
        ? examData.end_date instanceof Date
          ? formatDateToLocalISO(examData.end_date)
          : examData.end_date
        : undefined,
    }

    // Debug: Log what we're sending
    console.log('Form data before conversion:', formData)
    console.log('Exam data for backend:', examDataForBackend)

    // Actualizar el examen
    await examStore.updateExam(examId.value, examDataForBackend)

    // Asignar grupos si hay grupos seleccionados
    if (group_ids && group_ids.length > 0) {
      await examStore.assignGroupsToExam(examId.value, group_ids)
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Examen actualizado correctamente',
    })

    // Redireccionar al detalle del examen
    router.push(`/exams/${examId.value}`)
  } catch (error: any) {
    console.error('Error updating exam:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Error al actualizar el examen',
    })
  } finally {
    isUpdating.value = false
  }
}

const goBack = () => {
  router.push(`/exams/${examId.value}`)
}

const viewDetail = () => {
  router.push(`/exams/${examId.value}`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadExam(), loadGroups()])
})
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

.p-error {
  color: var(--red-500);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.p-invalid {
  border-color: var(--red-500);
}
</style>
