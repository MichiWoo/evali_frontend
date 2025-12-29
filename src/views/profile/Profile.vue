<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

// Stores
const authStore = useAuthStore()
const toast = useToast()

// Estado del componente
const isLoading = ref(false)
const isEditing = ref(false)
const showChangePassword = ref(false)

// Formulario de perfil
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  avatar: null,
  bio: '',
  location: '',
  website: '',
})

// Formulario de cambio de contraseña
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Validaciones
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Computed
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isProfessor = computed(() => authStore.isProfessor)
const isStudent = computed(() => authStore.isStudent)

// Métodos
const loadProfile = () => {
  if (user.value) {
    profileForm.name = user.value.name || ''
    profileForm.email = user.value.email || ''
    profileForm.phone = user.value.phone || ''
    profileForm.avatar = user.value.avatar || null
    profileForm.bio = user.value.bio || ''
    profileForm.location = user.value.location || ''
    profileForm.website = user.value.website || ''
  }
}

const validateProfileForm = () => {
  let isValid = true

  // Validar nombre
  if (!profileForm.name.trim()) {
    nameError.value = 'El nombre es requerido'
    isValid = false
  } else {
    nameError.value = ''
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!profileForm.email.trim()) {
    emailError.value = 'El email es requerido'
    isValid = false
  } else if (!emailRegex.test(profileForm.email)) {
    emailError.value = 'El email no es válido'
    isValid = false
  } else {
    emailError.value = ''
  }

  return isValid
}

const validatePasswordForm = () => {
  let isValid = true

  // Validar contraseña actual
  if (!passwordForm.currentPassword) {
    passwordError.value = 'La contraseña actual es requerida'
    isValid = false
  } else {
    passwordError.value = ''
  }

  // Validar nueva contraseña
  if (!passwordForm.newPassword) {
    passwordError.value = 'La nueva contraseña es requerida'
    isValid = false
  } else if (passwordForm.newPassword.length < 8) {
    passwordError.value = 'La nueva contraseña debe tener al menos 8 caracteres'
    isValid = false
  } else {
    passwordError.value = ''
  }

  // Validar confirmación
  if (!passwordForm.confirmPassword) {
    confirmPasswordError.value = 'Confirma la nueva contraseña'
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    confirmPasswordError.value = 'Las contraseñas no coinciden'
    isValid = false
  } else {
    confirmPasswordError.value = ''
  }

  return isValid
}

const saveProfile = async () => {
  if (!validateProfileForm()) {
    return
  }

  try {
    isLoading.value = true

    const result = await authStore.updateProfile(profileForm)

    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Perfil actualizado',
        detail: 'Tu perfil se ha actualizado correctamente',
        life: 3000,
      })
      isEditing.value = false
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: result.error || 'Error al actualizar el perfil',
        life: 5000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ha ocurrido un error inesperado',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const changePassword = async () => {
  if (!validatePasswordForm()) {
    return
  }

  try {
    isLoading.value = true

    const result = await authStore.changePassword({
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
      new_password_confirmation: passwordForm.confirmPassword,
    })

    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Contraseña cambiada',
        detail: 'Tu contraseña se ha cambiado correctamente',
        life: 3000,
      })
      showChangePassword.value = false
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: result.error || 'Error al cambiar la contraseña',
        life: 5000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ha ocurrido un error inesperado',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  loadProfile()
  isEditing.value = false
  nameError.value = ''
  emailError.value = ''
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'professor':
      return 'Profesor'
    case 'student':
      return 'Estudiante'
    default:
      return role
  }
}

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'professor':
      return 'warning'
    case 'student':
      return 'info'
    default:
      return 'secondary'
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="grid">
    <!-- Header -->
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Mi Perfil</h1>
            <p class="text-600">Gestiona tu información personal y configuración</p>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="!isEditing"
              label="Editar Perfil"
              icon="pi pi-pencil"
              @click="isEditing = true"
              class="p-button-primary"
            />
            <Button
              v-if="isEditing"
              label="Cancelar"
              icon="pi pi-times"
              @click="cancelEdit"
              class="p-button-outlined"
            />
            <Button
              v-if="isEditing"
              label="Guardar"
              icon="pi pi-check"
              @click="saveProfile"
              :loading="isLoading"
              class="p-button-success"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Información del perfil -->
    <div class="col-12 lg:col-8">
      <div class="card">
        <h5 class="text-900 font-medium mb-4">Información Personal</h5>

        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="name" class="block text-900 font-medium mb-2">Nombre completo</label>
              <InputText
                id="name"
                v-model="profileForm.name"
                :disabled="!isEditing"
                class="w-full"
                :class="{ 'p-invalid': nameError }"
              />
              <small v-if="nameError" class="p-error">{{ nameError }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="email" class="block text-900 font-medium mb-2">Email</label>
              <InputText
                id="email"
                v-model="profileForm.email"
                :disabled="!isEditing"
                class="w-full"
                :class="{ 'p-invalid': emailError }"
              />
              <small v-if="emailError" class="p-error">{{ emailError }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="phone" class="block text-900 font-medium mb-2">Teléfono</label>
              <InputText
                id="phone"
                v-model="profileForm.phone"
                :disabled="!isEditing"
                placeholder="+1 (555) 123-4567"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="location" class="block text-900 font-medium mb-2">Ubicación</label>
              <InputText
                id="location"
                v-model="profileForm.location"
                :disabled="!isEditing"
                placeholder="Ciudad, País"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="field">
              <label for="website" class="block text-900 font-medium mb-2">Sitio web</label>
              <InputText
                id="website"
                v-model="profileForm.website"
                :disabled="!isEditing"
                placeholder="https://tu-sitio-web.com"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="field">
              <label for="bio" class="block text-900 font-medium mb-2">Biografía</label>
              <Textarea
                id="bio"
                v-model="profileForm.bio"
                :disabled="!isEditing"
                placeholder="Cuéntanos sobre ti..."
                rows="4"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información de la cuenta -->
    <div class="col-12 lg:col-4">
      <div class="card">
        <h5 class="text-900 font-medium mb-4">Información de la Cuenta</h5>

        <div class="flex flex-column gap-4">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-user text-2xl text-primary"></i>
            <div>
              <div class="text-900 font-medium">Rol</div>
              <Tag :value="getRoleLabel(user?.role)" :severity="getRoleColor(user?.role)" />
            </div>
          </div>

          <div class="flex align-items-center gap-3">
            <i class="pi pi-calendar text-2xl text-primary"></i>
            <div>
              <div class="text-900 font-medium">Miembro desde</div>
              <div class="text-600">{{ new Date(user?.created_at).toLocaleDateString() }}</div>
            </div>
          </div>

          <div class="flex align-items-center gap-3">
            <i class="pi pi-shield text-2xl text-primary"></i>
            <div>
              <div class="text-900 font-medium">Estado</div>
              <Tag value="Activo" severity="success" />
            </div>
          </div>
        </div>
      </div>

      <!-- Cambio de contraseña -->
      <div class="card mt-4">
        <div class="flex justify-content-between align-items-center mb-4">
          <h5 class="text-900 font-medium mb-0">Seguridad</h5>
          <Button
            label="Cambiar Contraseña"
            icon="pi pi-key"
            class="p-button-outlined p-button-sm"
            @click="showChangePassword = !showChangePassword"
          />
        </div>

        <div v-if="showChangePassword" class="flex flex-column gap-3">
          <div class="field">
            <label for="currentPassword" class="block text-900 font-medium mb-2"
              >Contraseña actual</label
            >
            <Password
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              placeholder="Tu contraseña actual"
              class="w-full"
              :class="{ 'p-invalid': passwordError }"
              :feedback="false"
              toggleMask
            />
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>

          <div class="field">
            <label for="newPassword" class="block text-900 font-medium mb-2"
              >Nueva contraseña</label
            >
            <Password
              id="newPassword"
              v-model="passwordForm.newPassword"
              placeholder="Nueva contraseña"
              class="w-full"
              :class="{ 'p-invalid': passwordError }"
              :feedback="false"
              toggleMask
            />
          </div>

          <div class="field">
            <label for="confirmPassword" class="block text-900 font-medium mb-2"
              >Confirmar contraseña</label
            >
            <Password
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              placeholder="Confirma la nueva contraseña"
              class="w-full"
              :class="{ 'p-invalid': confirmPasswordError }"
              :feedback="false"
              toggleMask
            />
            <small v-if="confirmPasswordError" class="p-error">{{ confirmPasswordError }}</small>
          </div>

          <div class="flex gap-2">
            <Button
              label="Cambiar"
              icon="pi pi-check"
              @click="changePassword"
              :loading="isLoading"
              class="p-button-success flex-1"
            />
            <Button
              label="Cancelar"
              icon="pi pi-times"
              @click="showChangePassword = false"
              class="p-button-outlined flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s;
}

.field {
  margin-bottom: 1rem;
}

.p-error {
  display: block;
  margin-top: 0.5rem;
}
</style>
