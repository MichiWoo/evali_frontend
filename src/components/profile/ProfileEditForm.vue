<template>
  <div class="profile-edit-form">
    <form @submit.prevent="handleSubmit" class="form">
      <!-- Información Personal -->
      <div class="form-section">
        <h3>Información Personal</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="name">Nombre completo *</label>
            <InputText
              id="name"
              v-model="form.name"
              :class="{ 'p-invalid': errors.name }"
              placeholder="Ingresa tu nombre completo"
            />
            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Correo electrónico *</label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              :class="{ 'p-invalid': errors.email }"
              placeholder="tu@email.com"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="bio">Biografía</label>
            <Textarea
              id="bio"
              v-model="form.bio"
              :class="{ 'p-invalid': errors.bio }"
              placeholder="Cuéntanos algo sobre ti..."
              rows="4"
            />
            <small v-if="errors.bio" class="p-error">{{ errors.bio }}</small>
          </div>
        </div>
      </div>

      <!-- Avatar -->
      <div class="form-section">
        <h3>Foto de Perfil</h3>

        <div class="avatar-section">
          <div class="avatar-preview">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Avatar preview"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <i class="pi pi-user"></i>
            </div>
          </div>

          <div class="avatar-actions">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              style="display: none"
            />
            <Button
              label="Cambiar foto"
              icon="pi pi-upload"
              severity="secondary"
              @click="() => fileInput?.click()"
            />
            <Button
              v-if="avatarPreview"
              label="Eliminar"
              icon="pi pi-trash"
              severity="danger"
              text
              @click="removeAvatar"
            />
          </div>
        </div>
      </div>

      <!-- Cambio de Contraseña -->
      <div class="form-section">
        <h3>Cambiar Contraseña</h3>
        <p class="section-description">Deja en blanco si no quieres cambiar tu contraseña</p>

        <div class="form-row">
          <div class="form-group">
            <label for="current_password">Contraseña actual</label>
            <Password
              id="current_password"
              v-model="form.current_password"
              :class="{ 'p-invalid': errors.current_password }"
              placeholder="Ingresa tu contraseña actual"
              toggle-mask
            />
            <small v-if="errors.current_password" class="p-error">{{
              errors.current_password
            }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">Nueva contraseña</label>
            <Password
              id="password"
              v-model="form.password"
              :class="{ 'p-invalid': errors.password }"
              placeholder="Ingresa tu nueva contraseña"
              toggle-mask
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password_confirmation">Confirmar nueva contraseña</label>
            <Password
              id="password_confirmation"
              v-model="form.password_confirmation"
              :class="{ 'p-invalid': errors.password_confirmation }"
              placeholder="Confirma tu nueva contraseña"
              toggle-mask
            />
            <small v-if="errors.password_confirmation" class="p-error">{{
              errors.password_confirmation
            }}</small>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="form-actions">
        <Button type="button" label="Cancelar" severity="secondary" @click="$emit('cancel')" />
        <Button
          type="submit"
          label="Guardar Cambios"
          icon="pi pi-save"
          :loading="isUpdating"
          :disabled="!isFormValid"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import type { ProfileUpdateRequest } from '@/stores/profile'

const emit = defineEmits<{
  cancel: []
  success: []
}>()

const profileStore = useProfileStore()

// Form data
const form = ref<ProfileUpdateRequest & { bio?: string }>({
  name: '',
  email: '',
  current_password: '',
  password: '',
  password_confirmation: '',
  bio: '',
})

// File handling
const fileInput = ref<HTMLInputElement>()
const avatarPreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// Errors
const errors = ref<Record<string, string>>({})

// Computed
const isUpdating = computed(() => profileStore.isUpdating)
const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.email.trim() !== '' &&
    (!form.value.password || form.value.password === form.value.password_confirmation)
  )
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'El correo electrónico es requerido'
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'El correo electrónico no es válido'
  }

  if (form.value.password && form.value.password !== form.value.password_confirmation) {
    errors.value.password_confirmation = 'Las contraseñas no coinciden'
  }

  if (form.value.password && form.value.password.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
  }

  if (form.value.password && !form.value.current_password) {
    errors.value.current_password = 'La contraseña actual es requerida para cambiar la contraseña'
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const updateData: Partial<ProfileUpdateRequest> = {
      name: form.value.name,
      email: form.value.email,
    }

    // Only include password fields if they're provided
    if (form.value.current_password && form.value.password) {
      updateData.current_password = form.value.current_password
      updateData.password = form.value.password
      updateData.password_confirmation = form.value.password_confirmation
    }

    await profileStore.updateProfile(updateData)

    // Upload avatar if selected
    if (selectedFile.value) {
      await profileStore.uploadAvatar(selectedFile.value)
    }

    emit('success')
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.avatar = 'La imagen debe ser menor a 5MB'
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.value.avatar = 'Solo se permiten archivos de imagen'
      return
    }

    selectedFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Clear any previous errors
    delete errors.value.avatar
  }
}

const removeAvatar = () => {
  selectedFile.value = null
  avatarPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Load initial data
onMounted(async () => {
  try {
    await profileStore.fetchProfile()

    if (profileStore.user) {
      form.value = {
        name: profileStore.user.name || '',
        email: profileStore.user.email || '',
        bio: (profileStore.user as any).bio || '',
        current_password: '',
        password: '',
        password_confirmation: '',
      }

      // Set avatar preview if user has one
      if ((profileStore.user as any).avatar) {
        avatarPreview.value = (profileStore.user as any).avatar
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
})

// Watch for profile changes
watch(
  () => profileStore.user,
  (newUser) => {
    if (newUser) {
      form.value.name = newUser.name || ''
      form.value.email = newUser.email || ''
      form.value.bio = (newUser as any).bio || ''
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.profile-edit-form {
  max-width: 600px;
  margin: 0 auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.section-description {
  margin: 0 0 1.5rem 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-100);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  font-size: 2rem;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.p-error {
  color: var(--red-500);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
