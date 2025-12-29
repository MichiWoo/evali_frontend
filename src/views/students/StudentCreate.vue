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
            Crear Nuevo Estudiante
          </h1>
        </div>
        <p class="text-muted-color mb-6">Registra un nuevo estudiante en el sistema</p>

        <form @submit.prevent="createStudent">
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

              <div class="field">
                <label
                  for="password"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Contraseña Generada
                </label>
                <div class="flex gap-2">
                  <InputText
                    id="password"
                    v-model="formData.password"
                    readonly
                    class="w-full"
                    style="background-color: var(--surface-100)"
                  />
                  <Button
                    icon="pi pi-copy"
                    @click="copyPassword"
                    v-tooltip.top="'Copiar contraseña'"
                    class="p-button-outlined"
                  />
                  <Button
                    icon="pi pi-refresh"
                    @click="() => (formData.password = generatePassword())"
                    v-tooltip.top="'Generar nueva contraseña'"
                    class="p-button-outlined"
                  />
                </div>
                <small class="text-muted-color">
                  Contraseña generada automáticamente con mayúscula, número y símbolo
                </small>
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
                  Selecciona los grupos a los que pertenecerá el estudiante
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
                <Editor v-model="formData.bio" editorStyle="height: 200px" />
                <small class="text-muted-color mt-2 block">
                  Información opcional sobre el estudiante. Usa el editor para formatear el texto
                  con negritas, listas, etc.
                </small>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div
            class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700"
          >
            <Button label="Cancelar" icon="pi pi-times" outlined @click="goBack" type="button" />
            <Button
              label="Crear Estudiante"
              icon="pi pi-user-plus"
              :loading="isSubmitting"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de límite de plan -->
    <PlanLimitModal
      v-model="showPlanLimitModal"
      title="Límite de Estudiantes Alcanzado"
      message="Has alcanzado el límite de estudiantes de tu plan actual"
      description="Tu plan actual solo permite agregar un número limitado de estudiantes. Actualiza tu plan para agregar más estudiantes."
      resource-type="estudiantes"
      :limit-info="
        subscriptionStore.usage && subscriptionStore.currentPlan
          ? {
              current: subscriptionStore.usage.current_usage?.students || 0,
              limit: subscriptionStore.currentPlan.max_students || 0,
            }
          : undefined
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/students'
import { useGroupStore } from '@/stores/groups'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import type { Group } from '@/types'

// Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Editor from 'primevue/editor'
import PlanLimitModal from '@/components/plans/PlanLimitModal.vue'

// Composables
const router = useRouter()
const studentStore = useStudentStore()
const groupStore = useGroupStore()
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const availableGroups = ref<Group[]>([])
const showPlanLimitModal = ref(false)

// Form Data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  status: 'active' as 'active' | 'inactive',
  bio: '',
  group_ids: [] as number[],
})

// Options
const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
]

// Methods
const generatePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  // Asegurar al menos un carácter de cada tipo
  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Completar con caracteres aleatorios (longitud total: 12)
  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Mezclar la contraseña
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(formData.password)
    toast.add({
      severity: 'success',
      summary: 'Copiado',
      detail: 'Contraseña copiada al portapapeles',
    })
  } catch (_err) {
    console.error('Error copying password:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo copiar la contraseña',
    })
  }
}

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

  if (!formData.password.trim()) {
    errors.value.password = 'La contraseña es obligatoria'
  }

  if (formData.password.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const createStudent = async () => {
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

  if (!subscriptionStore.canAddStudent) {
    // Mostrar modal de advertencia
    showPlanLimitModal.value = true
    return
  }

  try {
    isSubmitting.value = true
    error.value = null

    // Crear el estudiante
    const newStudent = await studentStore.createStudent({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      status: formData.status,
      bio: formData.bio || null,
      group_ids: formData.group_ids,
    })

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estudiante creado correctamente',
    })

    // Redireccionar al detalle del estudiante
    router.push(`/students/${newStudent.id}`)
  } catch (err: any) {
    // Si el error es por límite de plan, mostrar modal
    if (err.response?.data?.error === 'plan_limit_exceeded' || err.response?.status === 403) {
      await subscriptionStore.fetchUsage()
      showPlanLimitModal.value = true
      return
    }

    error.value = err.response?.data?.message || err.message || 'Error al crear el estudiante'
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
  router.push('/students')
}

const loadGroups = async () => {
  try {
    await groupStore.fetchGroups()
    availableGroups.value = groupStore.groups
  } catch (_err) {
    console.error('Error loading groups:', err)
  }
}

// Lifecycle
onMounted(async () => {
  // Generar contraseña inicial
  formData.password = generatePassword()

  await loadGroups()
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
