<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-96">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="card">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else-if="!student" class="card">
    <Message severity="warn" :closable="false">Estudiante no encontrado</Message>
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
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
            Editar Estudiante
          </h1>
        </div>
        <p class="text-muted-color mb-6">
          Modifica la información del estudiante {{ student.name }}
        </p>

        <form @submit.prevent="updateStudent">
          <div class="grid">
            <!-- Información Personal -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Información Personal
              </h3>
            </div>

            <div class="col-12 lg:col-8">
              <div class="field">
                <label
                  for="name"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Nombre Completo <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="name"
                  v-model="formData.name"
                  placeholder="Ingresa el nombre completo del estudiante"
                  class="w-full"
                  :class="{ 'p-invalid': errors.name }"
                  required
                />
                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
              </div>

              <div class="field">
                <label
                  for="email"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Correo Electrónico <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="estudiante@ejemplo.com"
                  class="w-full"
                  :class="{ 'p-invalid': errors.email }"
                  required
                />
                <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
              </div>
            </div>

            <!-- Estado del Estudiante -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Estado del Estudiante
              </h3>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label
                  for="status"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Estado <span class="text-red-500">*</span>
                </label>
                <Select
                  id="status"
                  v-model="formData.status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecciona el estado"
                  class="w-full"
                  :class="{ 'p-invalid': errors.status }"
                />
                <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
              </div>
            </div>

            <!-- Información de Grupos -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Grupos Asignados
              </h3>
            </div>

            <div class="col-12 lg:col-8">
              <div class="field">
                <label
                  for="groups"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Grupos
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
                  Selecciona los grupos a los que pertenece el estudiante
                </small>
              </div>
            </div>

            <!-- Información Adicional -->
            <div class="col-12">
              <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
                Información Adicional
              </h3>
            </div>

            <div class="col-12 lg:col-8">
              <div class="field">
                <label
                  for="bio"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Biografía
                </label>
                <Editor
                  v-model="formData.bio"
                  editorStyle="height: 200px"
                  :key="`editor-${student?.id || 'new'}`"
                />
                <small class="text-muted-color mt-2 block">
                  Información opcional sobre el estudiante. Usa el editor para formatear el texto
                  con negritas, listas, etc.
                </small>
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                  Fecha de Registro
                </label>
                <InputText
                  :value="formatDate(student.created_at)"
                  readonly
                  class="w-full"
                  style="background-color: var(--surface-100)"
                />
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                  Último Acceso
                </label>
                <InputText
                  :value="student.last_login ? formatDate(student.last_login) : 'Nunca'"
                  readonly
                  class="w-full"
                  style="background-color: var(--surface-100)"
                />
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                  Última Actualización
                </label>
                <InputText
                  :value="formatDate(student.updated_at)"
                  readonly
                  class="w-full"
                  style="background-color: var(--surface-100)"
                />
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div
            class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700"
          >
            <Button label="Cancelar" icon="pi pi-times" outlined @click="goBack" type="button" />
            <Button
              label="Guardar Cambios"
              icon="pi pi-check"
              :loading="isSubmitting"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/students'
import { useGroupStore } from '@/stores/groups'
import { useToast } from 'primevue/usetoast'
import type { Group } from '@/types'

// Components
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Editor from 'primevue/editor'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Message from 'primevue/message'

// Composables
const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const groupStore = useGroupStore()
const toast = useToast()

// State
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const availableGroups = ref<Group[]>([])

// Form Data
const formData = reactive({
  name: '',
  email: '',
  status: 'active' as 'active' | 'inactive',
  bio: '',
  group_ids: [] as number[],
})

// Options
const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
]

// Computed
const student = computed(() => studentStore.currentStudent)

// Methods
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  }

  if (formData.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }

  if (!formData.email.trim()) {
    errors.value.email = 'El correo electrónico es obligatorio'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    errors.value.email = 'El correo electrónico no es válido'
  }

  return Object.keys(errors.value).length === 0
}

const updateStudent = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Por favor corrige los errores en el formulario',
    })
    return
  }

  try {
    isSubmitting.value = true
    error.value = null

    // Actualizar información básica del estudiante incluyendo grupos
    await studentStore.updateStudent(student.value!.id, {
      name: formData.name,
      email: formData.email,
      status: formData.status,
      bio: formData.bio || null,
      group_ids: formData.group_ids,
    })

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estudiante actualizado correctamente',
    })

    // Redireccionar al detalle del estudiante
    router.push(`/students/${student.value!.id}`)
  } catch (err: any) {
    error.value = err.message || 'Error al actualizar el estudiante'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
    })
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push(`/students/${student.value?.id}`)
}

const loadStudentData = async () => {
  try {
    isLoading.value = true
    error.value = null

    const studentId = parseInt(route.params.id as string)
    await studentStore.fetchStudent(studentId)

    // Esperar un tick para asegurar que el componente esté listo
    await nextTick()

    if (student.value) {
      // Llenar el formulario con los datos del estudiante
      formData.name = student.value.name || ''
      formData.email = student.value.email || ''
      formData.status = student.value.status || 'active'

      // Asegurar que bio se asigne correctamente (puede ser null, undefined, o string vacío)
      const bioValue = student.value.bio
      formData.bio = bioValue !== null && bioValue !== undefined ? String(bioValue) : ''

      formData.group_ids = student.value.user_groups?.map((g) => g.id) || []

      // Esperar otro tick después de asignar los valores para que el Editor se actualice
      await nextTick()
    }
  } catch (err: any) {
    error.value = err.message || 'Error al cargar datos del estudiante'
  } finally {
    isLoading.value = false
  }
}

// Watch para actualizar el formulario cuando cambie el estudiante (después de la carga inicial)
watch(
  () => student.value,
  (newStudent) => {
    if (newStudent && !isLoading.value) {
      nextTick(() => {
        formData.name = newStudent.name
        formData.email = newStudent.email
        formData.status = newStudent.status
        formData.bio = newStudent.bio || ''
        formData.group_ids = newStudent.user_groups?.map((g) => g.id) || []
      })
    }
  },
)

const loadGroups = async () => {
  try {
    await groupStore.fetchGroups()
    availableGroups.value = groupStore.groups
  } catch (_err) {
    console.error('Error loading groups:', err)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadStudentData(), loadGroups()])
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
