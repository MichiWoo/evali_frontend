<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-96">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="card">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else-if="!group" class="card">
    <Message severity="warn" :closable="false">Grupo no encontrado</Message>
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
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">Editar Grupo</h1>
        </div>
        <p class="text-muted-color mb-6">Modifica la configuración del grupo "{{ group.name }}"</p>

        <form @submit.prevent="updateGroup">
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

            <!-- Información de Estado -->
            <div class="col-12">
              <div class="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div class="flex items-start gap-3">
                  <i class="pi pi-info-circle text-blue-500 text-xl mt-1"></i>
                  <div>
                    <h4 class="text-blue-900 dark:text-blue-100 font-semibold mb-2">
                      Información del Grupo
                    </h4>
                    <div class="grid">
                      <div class="col-12 md:col-6">
                        <p class="text-blue-800 dark:text-blue-200 mb-1">
                          <strong>Estudiantes:</strong> {{ group.users?.length || 0 }}
                        </p>
                        <p class="text-blue-800 dark:text-blue-200 mb-1">
                          <strong>Exámenes asignados:</strong> {{ group.exams?.length || 0 }}
                        </p>
                      </div>
                      <div class="col-12 md:col-6">
                        <p class="text-blue-800 dark:text-blue-200 mb-1">
                          <strong>Creado:</strong> {{ formatDate(group.created_at) }}
                        </p>
                        <p class="text-blue-800 dark:text-blue-200">
                          <strong>Última actualización:</strong> {{ formatDate(group.updated_at) }}
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
import { useGroupStore } from '@/stores/groups'
import { useExamStore } from '@/stores/exams'
import { useToast } from 'primevue/usetoast'
import type { UpdateGroupRequest } from '@/types'

// Components
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'

// Composables
const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const examStore = useExamStore()
const toast = useToast()

// State
const groupId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const isUpdating = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const availableExams = ref<any[]>([])

// Status options
const statusOptions = ref([
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Pendiente', value: 'pending' },
])

// Form Data
const formData = reactive<
  Omit<UpdateGroupRequest, 'id'> & {
    exam_ids?: number[]
  }
>({
  name: '',
  description: '',
  status: 'active',
  exam_ids: [],
})

// Computed
const group = computed(() => groupStore.currentGroup)

// Methods
const loadGroup = async () => {
  try {
    isLoading.value = true
    error.value = null
    await groupStore.fetchGroup(groupId.value)

    if (group.value) {
      // Cargar datos del grupo en el formulario
      formData.name = group.value.name
      formData.description = group.value.description || ''
      formData.status = group.value.status
      formData.exam_ids = group.value.exams?.map((exam) => exam.id) || []
    }
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el grupo'
    console.error('Error loading group:', err)
  } finally {
    isLoading.value = false
  }
}

const loadExams = async () => {
  try {
    await examStore.fetchExams()
    availableExams.value = examStore.exams
  } catch (_error) {
    console.error('Error loading exams:', error)
  }
}

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

const updateGroup = async () => {
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

    // Separar los datos del grupo de los exámenes
    const { exam_ids, ...groupData } = formData

    // Actualizar el grupo
    await groupStore.updateGroup(groupId.value, { ...groupData, id: groupId.value })

    // Asignar exámenes si hay exámenes seleccionados
    if (exam_ids && exam_ids.length > 0) {
      await groupStore.assignExamsToGroup(groupId.value, exam_ids)
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Grupo actualizado correctamente',
    })

    // Redireccionar al detalle del grupo
    router.push(`/groups/${groupId.value}`)
  } catch (error: any) {
    console.error('Error updating group:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Error al actualizar el grupo',
    })
  } finally {
    isUpdating.value = false
  }
}

const goBack = () => {
  router.push(`/groups/${groupId.value}`)
}

const viewDetail = () => {
  router.push(`/groups/${groupId.value}`)
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
  await Promise.all([loadGroup(), loadExams()])
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
