<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Editar Usuario</h1>
            <p class="text-600 m-0">Modificar información del usuario</p>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-arrow-left"
              label="Volver"
              severity="secondary"
              outlined
              @click="goBack"
            />
            <Button
              icon="pi pi-eye"
              label="Ver Detalles"
              severity="secondary"
              outlined
              @click="viewUser"
            />
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>

        <div v-else-if="user" class="grid">
          <!-- Form -->
          <div class="col-12 lg:col-8">
            <form @submit.prevent="updateUser" class="flex flex-column gap-4">
              <!-- Basic Information -->
              <div class="card">
                <h3 class="text-xl font-semibold mb-3">Información Básica</h3>

                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label for="name" class="font-semibold">Nombre Completo *</label>
                      <InputText
                        id="name"
                        v-model="form.name"
                        placeholder="Ingresa el nombre completo"
                        :class="{ 'p-invalid': errors.name }"
                        class="w-full"
                      />
                      <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                    </div>
                  </div>

                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label for="email" class="font-semibold">Correo Electrónico *</label>
                      <InputText
                        id="email"
                        v-model="form.email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        :class="{ 'p-invalid': errors.email }"
                        class="w-full"
                      />
                      <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                    </div>
                  </div>
                </div>

                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label for="bio" class="font-semibold">Biografía</label>
                      <Textarea
                        id="bio"
                        v-model="form.bio"
                        placeholder="Información adicional sobre el usuario..."
                        rows="3"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label for="avatar" class="font-semibold">Avatar URL</label>
                      <InputText
                        id="avatar"
                        v-model="form.avatar"
                        placeholder="https://ejemplo.com/avatar.jpg"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Roles and Permissions -->
              <div class="card">
                <h3 class="text-xl font-semibold mb-3">Roles y Permisos</h3>

                <div class="field">
                  <label class="font-semibold">Roles *</label>
                  <div class="flex flex-column gap-2 mt-2">
                    <div
                      v-for="role in availableRoles"
                      :key="role.id"
                      class="flex align-items-center"
                    >
                      <Checkbox
                        :id="`role-${role.id}`"
                        v-model="form.role_ids"
                        :value="role.id"
                        :class="{ 'p-invalid': errors.role_ids }"
                      />
                      <label :for="`role-${role.id}`" class="ml-2 cursor-pointer">
                        <div class="font-semibold">{{ role.meta.display_name }}</div>
                        <div class="text-sm text-600">{{ role.meta.description }}</div>
                      </label>
                    </div>
                  </div>
                  <small v-if="errors.role_ids" class="p-error">{{ errors.role_ids }}</small>
                </div>
              </div>

              <!-- Status and Security -->
              <div class="card">
                <h3 class="text-xl font-semibold mb-3">Estado y Seguridad</h3>

                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label for="status" class="font-semibold">Estado</label>
                      <Select
                        id="status"
                        v-model="form.status"
                        :options="statusOptions"
                        option-label="label"
                        option-value="value"
                        placeholder="Seleccionar estado"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label for="email_verified" class="font-semibold"
                        >Verificación de Email</label
                      >
                      <div class="flex align-items-center gap-2">
                        <Checkbox id="email_verified" v-model="form.email_verified" />
                        <label for="email_verified" class="cursor-pointer">
                          Email verificado
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field">
                  <label class="font-semibold">Cambiar Contraseña</label>
                  <div class="flex align-items-center gap-2 mb-2">
                    <Checkbox id="change_password" v-model="form.change_password" />
                    <label for="change_password" class="cursor-pointer"> Cambiar contraseña </label>
                  </div>

                  <div v-if="form.change_password" class="grid">
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label for="password" class="font-semibold">Nueva Contraseña</label>
                        <Password
                          id="password"
                          v-model="form.password"
                          placeholder="Mínimo 8 caracteres"
                          :class="{ 'p-invalid': errors.password }"
                          class="w-full"
                          :feedback="true"
                          toggleMask
                        />
                        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                      </div>
                    </div>

                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label for="password_confirmation" class="font-semibold"
                          >Confirmar Contraseña</label
                        >
                        <Password
                          id="password_confirmation"
                          v-model="form.password_confirmation"
                          placeholder="Repite la contraseña"
                          :class="{ 'p-invalid': errors.password_confirmation }"
                          class="w-full"
                          :feedback="false"
                          toggleMask
                        />
                        <small v-if="errors.password_confirmation" class="p-error">{{
                          errors.password_confirmation
                        }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="flex justify-content-end gap-2">
                <Button label="Cancelar" severity="secondary" outlined @click="goBack" />
                <Button label="Actualizar Usuario" type="submit" :loading="isSubmitting" />
              </div>
            </form>
          </div>

          <!-- Preview -->
          <div class="col-12 lg:col-4">
            <div class="card">
              <h3 class="text-xl font-semibold mb-3">Vista Previa</h3>

              <div
                class="flex flex-column align-items-center gap-3 p-4 border-1 border-200 border-round"
              >
                <Avatar
                  :image="form.avatar"
                  :label="form.name ? form.name.charAt(0).toUpperCase() : 'U'"
                  shape="circle"
                  size="large"
                />
                <div class="text-center">
                  <div class="font-semibold text-lg">{{ form.name || 'Nombre del Usuario' }}</div>
                  <div class="text-600">{{ form.email || 'usuario@ejemplo.com' }}</div>
                  <div v-if="form.bio" class="text-sm text-600 mt-2">{{ form.bio }}</div>
                </div>

                <div class="flex flex-wrap gap-1 justify-content-center">
                  <Tag
                    :value="form.email_verified ? 'Verificado' : 'Pendiente'"
                    :severity="form.email_verified ? 'success' : 'warning'"
                  />
                </div>

                <div
                  v-if="form.role_ids && form.role_ids.length > 0"
                  class="flex flex-wrap gap-1 justify-content-center"
                >
                  <Tag
                    v-for="roleId in form.role_ids"
                    :key="roleId"
                    :value="getRoleName(roleId)"
                    :severity="getRoleSeverity(getRoleName(roleId))"
                  />
                </div>
              </div>
            </div>

            <!-- User Stats -->
            <div class="card mt-3">
              <h3 class="text-lg font-semibold mb-3">Estadísticas</h3>
              <div class="flex flex-column gap-2">
                <div class="flex justify-content-between">
                  <span class="text-600">Registro:</span>
                  <span class="font-semibold">{{ formatDate(user.created_at) }}</span>
                </div>
                <div class="flex justify-content-between">
                  <span class="text-600">Última actualización:</span>
                  <span class="font-semibold">{{ formatDate(user.updated_at) }}</span>
                </div>
                <div class="flex justify-content-between">
                  <span class="text-600">Último acceso:</span>
                  <span class="font-semibold">{{
                    (user as any).last_login ? formatDate((user as any).last_login) : 'Nunca'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center p-4">
          <i class="pi pi-exclamation-triangle text-4xl text-600 mb-3"></i>
          <h3 class="text-xl font-semibold mb-2">Usuario no encontrado</h3>
          <p class="text-600 mb-4">
            El usuario que buscas no existe o no tienes permisos para editarlo.
          </p>
          <Button label="Volver a Usuarios" @click="goBack" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { useToast } from 'primevue/usetoast'

// Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'

// Router and stores
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const toast = useToast()

// State
const isSubmitting = ref(false)
const availableRoles = ref([])

// Form data
const form = ref({
  name: '',
  email: '',
  bio: '',
  avatar: '',
  role_ids: [],
  status: 'active',
  email_verified: false,
  change_password: false,
  password: '',
  password_confirmation: '',
})

// Form errors
const errors = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role_ids: '',
})

// Options
const statusOptions = ref([
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Pendiente', value: 'pending' },
])

// Computed
const user = computed(() => userStore.currentUser)
const isLoading = computed(() => userStore.isLoading)

// Methods
const loadUser = async () => {
  try {
    const userId = parseInt(route.params.id as string)
    await userStore.fetchUser(userId)

    if (user.value) {
      // Populate form with user data
      form.value = {
        name: user.value.name,
        email: user.value.email,
        bio: user.value.bio || '',
        avatar: user.value.avatar || '',
        role_ids: user.value.roles?.map((role) => role.id) || [],
        status: 'active', // TODO: Add status field to user model
        email_verified: !!user.value.email_verified_at,
        change_password: false,
        password: '',
        password_confirmation: '',
      }
    }
  } catch (error) {
    console.error('Error loading user:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el usuario',
      life: 3000,
    })
  }
}

const loadRoles = async () => {
  try {
    await userStore.fetchRoles()
    availableRoles.value = userStore.roles
  } catch (error) {
    console.error('Error loading roles:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los roles',
      life: 3000,
    })
  }
}

const validateForm = () => {
  errors.value = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_ids: '',
  }

  let isValid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
    isValid = false
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'El correo electrónico no es válido'
    isValid = false
  }

  if (form.value.change_password) {
    if (!form.value.password) {
      errors.value.password = 'La contraseña es requerida'
      isValid = false
    } else if (form.value.password.length < 8) {
      errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
      isValid = false
    }

    if (form.value.password !== form.value.password_confirmation) {
      errors.value.password_confirmation = 'Las contraseñas no coinciden'
      isValid = false
    }
  }

  if (!form.value.role_ids || form.value.role_ids.length === 0) {
    errors.value.role_ids = 'Debe seleccionar al menos un rol'
    isValid = false
  }

  return isValid
}

const updateUser = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const updateData: any = {
      name: form.value.name,
      email: form.value.email,
      bio: form.value.bio,
      avatar: form.value.avatar,
      role_ids: form.value.role_ids,
    }

    if (form.value.change_password && form.value.password) {
      updateData.password = form.value.password
    }

    await userStore.updateUser(user.value!.id, updateData)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario actualizado correctamente',
      life: 3000,
    })

    router.push('/admin/users')
  } catch (error: any) {
    console.error('Error updating user:', error)

    // Handle validation errors from backend
    if (error.response?.data?.errors) {
      const backendErrors = error.response.data.errors
      Object.keys(backendErrors).forEach((key) => {
        if (errors.value.hasOwnProperty(key)) {
          errors.value[key] = backendErrors[key][0]
        }
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'No se pudo actualizar el usuario',
        life: 3000,
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const getRoleName = (roleId: number) => {
  const role = availableRoles.value.find((r) => r.id === roleId)
  return role ? role.meta.display_name : 'Rol'
}

const getRoleSeverity = (roleName: string) => {
  switch (roleName) {
    case 'Administrador':
      return 'danger'
    case 'Profesor':
      return 'info'
    case 'Estudiante':
      return 'success'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const goBack = () => {
  router.push('/admin/users')
}

const viewUser = () => {
  router.push(`/admin/users/${user.value?.id}`)
}

// Watch for password change
watch(
  () => form.value.change_password,
  (newValue) => {
    if (!newValue) {
      form.value.password = ''
      form.value.password_confirmation = ''
      errors.value.password = ''
      errors.value.password_confirmation = ''
    }
  },
)

// Lifecycle
onMounted(async () => {
  await Promise.all([loadUser(), loadRoles()])
})
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}

:deep(.p-checkbox) {
  margin-right: 0.5rem;
}
</style>
