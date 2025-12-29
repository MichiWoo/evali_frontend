<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <Button
            icon="pi pi-arrow-left"
            text
            @click="goBack"
            class="p-button-sm"
            v-tooltip.top="'Volver a la lista'"
          />
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
            Crear Nuevo Examen
          </h1>
        </div>
        <p class="text-muted-color mb-6">Configura un nuevo examen para tus estudiantes</p>

        <form @submit.prevent="createExam">
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
                    Tiempo Límite (min)
                  </label>
                  <InputNumber
                    id="time_limit"
                    v-model="formData.duration"
                    :min="1"
                    :max="600"
                    placeholder="60"
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
                    :value="1"
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

            <!-- Asignación de Grupos (si están disponibles) -->
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
          </div>

          <!-- Botones de Acción -->
          <div
            class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700"
          >
            <Button label="Cancelar" icon="pi pi-times" outlined @click="goBack" type="button" />
            <Button label="Crear Examen" icon="pi pi-check" :loading="isLoading" type="submit" />
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de límite de plan -->
    <PlanLimitModal
      v-model="showPlanLimitModal"
      title="Límite de Exámenes Alcanzado"
      message="Has alcanzado el límite de exámenes de tu plan actual"
      description="Tu plan actual solo permite crear un número limitado de exámenes. Actualiza tu plan para crear más exámenes."
      resource-type="exámenes"
      :limit-info="
        subscriptionStore.usage && subscriptionStore.currentPlan
          ? {
              current: subscriptionStore.usage.current_usage?.exams || 0,
              limit: subscriptionStore.currentPlan.max_exams || 0,
            }
          : undefined
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exams'
import { useGroupStore } from '@/stores/groups'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import type { CreateExamRequest, CreateExamBackendRequest } from '@/types'
import { formatDateToLocalISO } from '@/utils/date'

// Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import PlanLimitModal from '@/components/plans/PlanLimitModal.vue'

// Composables
const router = useRouter()
const examStore = useExamStore()
const groupStore = useGroupStore()
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const availableGroups = ref<any[]>([])
const showPlanLimitModal = ref(false)

// Form Data
const formData = reactive<CreateExamRequest>({
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

// Methods
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

const createExam = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Por favor corrige los errores en el formulario',
    })
    return
  }

  // Verificar límites del plan antes de crear
  await subscriptionStore.fetchUsage()

  if (!subscriptionStore.canCreateExam) {
    // Mostrar modal de advertencia
    showPlanLimitModal.value = true
    return
  }

  try {
    isLoading.value = true

    // Separar los datos del examen de los grupos
    const { group_ids, ...examData } = formData

    // Convertir fechas Date a string para el backend (preservando hora local, sin convertir a UTC)
    const examDataForBackend: CreateExamBackendRequest = {
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

    // Crear el examen
    const response = await examStore.createExam(examDataForBackend)

    if (response) {
      // Asignar grupos si hay grupos seleccionados
      if (group_ids && group_ids.length > 0) {
        await examStore.assignGroupsToExam(response.data.id, group_ids)
      }

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Examen creado correctamente',
      })

      // Redireccionar al detalle del examen creado
      router.push(`/exams/${response.data.id}`)
    }
  } catch (error: any) {
    console.error('Error creating exam:', error)

    // Si el error es por límite de plan, mostrar modal
    if (error.response?.data?.error === 'plan_limit_exceeded' || error.response?.status === 403) {
      await subscriptionStore.fetchUsage()
      showPlanLimitModal.value = true
      return
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || error.message || 'Error al crear el examen',
    })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/exams')
}

const loadGroups = async () => {
  try {
    await groupStore.fetchGroups()
    availableGroups.value = groupStore.groups
  } catch (_error) {
    console.error('Error loading groups:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadGroups()
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
