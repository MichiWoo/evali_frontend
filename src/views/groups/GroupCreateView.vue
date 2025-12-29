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
            Crear Nuevo Grupo
          </h1>
        </div>
        <p class="text-muted-color mb-6">
          Configura un nuevo grupo para organizar a tus estudiantes
        </p>

        <form @submit.prevent="createGroup">
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
                  for="name"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Nombre del Grupo <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="name"
                  v-model="formData.name"
                  placeholder="Ingresa el nombre del grupo"
                  class="w-full"
                  :class="{ 'p-invalid': errors.name }"
                  required
                />
                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
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
                  placeholder="Describe el propósito y características del grupo..."
                  rows="4"
                  class="w-full"
                />
                <small class="text-muted-color">
                  Proporciona información sobre el grupo para que los estudiantes sepan qué esperar
                </small>
              </div>
            </div>

            <!-- Configuración del Grupo -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Configuración del Grupo
              </h3>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label
                  for="status"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Estado del Grupo
                </label>
                <Select
                  id="status"
                  v-model="formData.status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecciona el estado"
                  class="w-full"
                />
                <small class="text-muted-color">
                  Los grupos activos pueden recibir estudiantes y exámenes
                </small>
              </div>
            </div>

            <!-- Asignación de Exámenes (si están disponibles) -->
            <div class="col-12 lg:col-6" v-if="availableExams.length > 0">
              <div class="field">
                <label
                  for="exams"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Asignar Exámenes
                </label>
                <MultiSelect
                  id="exams"
                  v-model="formData.exam_ids"
                  :options="availableExams"
                  optionLabel="title"
                  optionValue="id"
                  placeholder="Selecciona los exámenes"
                  class="w-full"
                  :filter="true"
                  :maxSelectedLabels="3"
                />
                <small class="text-muted-color">
                  Selecciona los exámenes que estarán disponibles para este grupo
                </small>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div
            class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700"
          >
            <Button label="Cancelar" icon="pi pi-times" outlined @click="goBack" type="button" />
            <Button label="Crear Grupo" icon="pi pi-check" :loading="isLoading" type="submit" />
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de límite de plan -->
    <PlanLimitModal
      v-model="showPlanLimitModal"
      title="Límite de Grupos Alcanzado"
      message="Has alcanzado el límite de grupos de tu plan actual"
      description="Tu plan actual solo permite crear un número limitado de grupos. Actualiza tu plan para crear más grupos."
      resource-type="grupos"
      :limit-info="
        subscriptionStore.usage && subscriptionStore.currentPlan
          ? {
              current: subscriptionStore.usage.current_usage?.groups || 0,
              limit: subscriptionStore.currentPlan.max_groups || 0,
            }
          : undefined
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/groups'
import { useExamStore } from '@/stores/exams'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import type { CreateGroupRequest } from '@/types'

// Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import PlanLimitModal from '@/components/plans/PlanLimitModal.vue'

// Composables
const router = useRouter()
const groupStore = useGroupStore()
const examStore = useExamStore()
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const availableExams = ref<any[]>([])
const showPlanLimitModal = ref(false)

// Status options
const statusOptions = ref([
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Pendiente', value: 'pending' },
])

// Form Data
const formData = reactive<
  CreateGroupRequest & {
    exam_ids?: number[]
  }
>({
  name: '',
  description: '',
  status: 'active',
  exam_ids: [],
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  }

  if (formData.name.trim().length < 3) {
    errors.value.name = 'El nombre debe tener al menos 3 caracteres'
  }

  if (formData.name.trim().length > 100) {
    errors.value.name = 'El nombre no puede tener más de 100 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const createGroup = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Por favor corrige los errores en el formulario',
    })
    return
  }

  try {
    isLoading.value = true

    // Separar los datos del grupo de los exámenes
    const { exam_ids, ...groupData } = formData

    // Crear el grupo
    const response = await groupStore.createGroup(groupData)

    if (response) {
      // Asignar exámenes si hay exámenes seleccionados
      if (exam_ids && exam_ids.length > 0) {
        await groupStore.assignExamsToGroup(response.id, exam_ids)
      }

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Grupo creado correctamente',
      })

      // Redireccionar al detalle del grupo creado
      router.push(`/groups/${response.id}`)
    }
  } catch (error: any) {
    console.error('Error creating group:', error)

    // Si el error es por límite de plan, mostrar modal
    if (error.response?.data?.error === 'plan_limit_exceeded' || error.response?.status === 403) {
      await subscriptionStore.fetchUsage()
      showPlanLimitModal.value = true
      return
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || error.message || 'Error al crear el grupo',
    })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/groups')
}

const loadExams = async () => {
  try {
    await examStore.fetchExams()
    availableExams.value = examStore.exams
  } catch (_error) {
    console.error('Error loading exams:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadExams()
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
