<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Detalles del Usuario</h1>
            <p class="text-600 m-0">Información completa del usuario</p>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-arrow-left"
              label="Volver"
              severity="secondary"
              outlined
              @click="goBack"
            />
            <Button icon="pi pi-pencil" label="Editar" @click="editUser" />
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>

        <div v-else-if="user" class="grid">
          <!-- User Profile -->
          <div class="col-12 lg:col-4">
            <div class="card">
              <div class="flex flex-column align-items-center gap-3 p-4">
                <Avatar
                  :image="user.avatar"
                  :label="user.name.charAt(0).toUpperCase()"
                  shape="circle"
                  size="xlarge"
                />
                <div class="text-center">
                  <div class="font-semibold text-xl">{{ user.name }}</div>
                  <div class="text-600">{{ user.email }}</div>
                  <div class="mt-2">
                    <Tag
                      :value="user.email_verified_at ? 'Verificado' : 'Pendiente'"
                      :severity="user.email_verified_at ? 'success' : 'warning'"
                    />
                  </div>
                </div>

                <div class="flex flex-wrap gap-1 justify-content-center">
                  <Tag
                    v-for="role in user.roles"
                    :key="role.id"
                    :value="role.meta.display_name"
                    :severity="getRoleSeverity(role.name)"
                  />
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mt-3">
              <h3 class="text-lg font-semibold mb-3">Acciones Rápidas</h3>
              <div class="flex flex-column gap-2">
                <Button
                  label="Enviar Email de Verificación"
                  icon="pi pi-envelope"
                  severity="secondary"
                  outlined
                  @click="sendVerificationEmail"
                  :loading="isSendingEmail"
                />
                <Button
                  label="Cambiar Contraseña"
                  icon="pi pi-key"
                  severity="secondary"
                  outlined
                  @click="showPasswordDialog = true"
                />
                <Button
                  label="Eliminar Usuario"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  @click="confirmDelete"
                />
              </div>
            </div>
          </div>

          <!-- User Information -->
          <div class="col-12 lg:col-8">
            <div class="grid">
              <!-- Basic Information -->
              <div class="col-12">
                <div class="card">
                  <h3 class="text-lg font-semibold mb-3">Información Básica</h3>
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label class="font-semibold text-600">Nombre Completo</label>
                        <div class="text-900">{{ user.name }}</div>
                      </div>
                    </div>
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label class="font-semibold text-600">Correo Electrónico</label>
                        <div class="text-900">{{ user.email }}</div>
                      </div>
                    </div>
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label class="font-semibold text-600">Estado de Verificación</label>
                        <div class="text-900">
                          <Tag
                            :value="user.email_verified_at ? 'Verificado' : 'Pendiente'"
                            :severity="user.email_verified_at ? 'success' : 'warning'"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label class="font-semibold text-600">Fecha de Registro</label>
                        <div class="text-900">{{ formatDate(user.created_at) }}</div>
                      </div>
                    </div>
                    <div class="col-12" v-if="user.bio">
                      <div class="field">
                        <label class="font-semibold text-600">Biografía</label>
                        <div class="text-900">{{ user.bio }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Roles and Permissions -->
              <div class="col-12">
                <div class="card">
                  <h3 class="text-lg font-semibold mb-3">Roles y Permisos</h3>
                  <div class="flex flex-wrap gap-2">
                    <Tag
                      v-for="role in user.roles"
                      :key="role.id"
                      :value="role.meta.display_name"
                      :severity="getRoleSeverity(role.name)"
                    />
                  </div>
                </div>
              </div>

              <!-- Activity Information -->
              <div class="col-12">
                <div class="card">
                  <h3 class="text-lg font-semibold mb-3">Actividad</h3>
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label class="font-semibold text-600">Último Acceso</label>
                        <div class="text-900">
                          {{
                            (user as any).last_login
                              ? formatDate((user as any).last_login)
                              : 'Nunca'
                          }}
                        </div>
                      </div>
                    </div>
                    <div class="col-12 md:col-6">
                      <div class="field">
                        <label class="font-semibold text-600">Última Actualización</label>
                        <div class="text-900">{{ formatDate(user.updated_at) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subscriptions -->
              <div class="col-12" v-if="user.subscriptions && user.subscriptions.length > 0">
                <div class="card">
                  <h3 class="text-lg font-semibold mb-3">Suscripciones</h3>
                  <div class="grid">
                    <div
                      v-for="subscription in user.subscriptions"
                      :key="subscription.id"
                      class="col-12 md:col-6"
                    >
                      <div class="border-1 border-200 border-round p-3">
                        <div class="font-semibold">{{ subscription.plan?.name || 'Plan' }}</div>
                        <div class="text-sm text-600">
                          Estado:
                          <Tag
                            :value="subscription.status"
                            :severity="getSubscriptionSeverity(subscription.status)"
                          />
                        </div>
                        <div class="text-sm text-600">
                          Inicio: {{ formatDate(subscription.starts_at) }}
                        </div>
                        <div v-if="subscription.ends_at" class="text-sm text-600">
                          Fin: {{ formatDate(subscription.ends_at) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center p-4">
          <i class="pi pi-exclamation-triangle text-4xl text-600 mb-3"></i>
          <h3 class="text-xl font-semibold mb-2">Usuario no encontrado</h3>
          <p class="text-600 mb-4">
            El usuario que buscas no existe o no tienes permisos para verlo.
          </p>
          <Button label="Volver a Usuarios" @click="goBack" />
        </div>
      </div>
    </div>

    <!-- Change Password Dialog -->
    <Dialog
      v-model:visible="showPasswordDialog"
      header="Cambiar Contraseña"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="new-password" class="font-semibold">Nueva Contraseña *</label>
          <Password
            id="new-password"
            v-model="newPassword"
            placeholder="Mínimo 8 caracteres"
            class="w-full"
            :feedback="true"
            toggleMask
          />
        </div>
        <div class="field">
          <label for="confirm-password" class="font-semibold">Confirmar Contraseña *</label>
          <Password
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="Repite la contraseña"
            class="w-full"
            :feedback="false"
            toggleMask
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" outlined @click="closePasswordDialog" />
        <Button label="Cambiar" @click="changePassword" :loading="isChangingPassword" />
      </template>
    </Dialog>

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

// Components
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'

// Router and stores
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const confirm = useConfirm()
const toast = useToast()

// State
const showPasswordDialog = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const isSendingEmail = ref(false)
const isChangingPassword = ref(false)

// Computed
const user = computed(() => userStore.currentUser)
const isLoading = computed(() => userStore.isLoading)

// Methods
const loadUser = async () => {
  try {
    const userId = parseInt(route.params.id as string)
    await userStore.fetchUser(userId)
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

const goBack = () => {
  router.push('/admin/users')
}

const editUser = () => {
  router.push(`/admin/users/${user.value?.id}/edit`)
}

const sendVerificationEmail = async () => {
  try {
    isSendingEmail.value = true
    // TODO: Implement send verification email
    toast.add({
      severity: 'info',
      summary: 'Email',
      detail: 'Funcionalidad de envío de email en desarrollo',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo enviar el email',
      life: 3000,
    })
  } finally {
    isSendingEmail.value = false
  }
}

const confirmDelete = () => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar al usuario "${user.value?.name}"?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    accept: () => deleteUser(),
  })
}

const deleteUser = async () => {
  try {
    if (user.value) {
      await userStore.deleteUser(user.value.id)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario eliminado correctamente',
        life: 3000,
      })
      router.push('/admin/users')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el usuario',
      life: 3000,
    })
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

const changePassword = async () => {
  if (!newPassword.value || newPassword.value.length < 8) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'La contraseña debe tener al menos 8 caracteres',
      life: 3000,
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Las contraseñas no coinciden',
      life: 3000,
    })
    return
  }

  try {
    isChangingPassword.value = true
    // TODO: Implement change password
    toast.add({
      severity: 'info',
      summary: 'Contraseña',
      detail: 'Funcionalidad de cambio de contraseña en desarrollo',
      life: 3000,
    })
    closePasswordDialog()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar la contraseña',
      life: 3000,
    })
  } finally {
    isChangingPassword.value = false
  }
}

const getRoleSeverity = (roleName: string) => {
  switch (roleName) {
    case 'admin':
      return 'danger'
    case 'teacher':
      return 'info'
    case 'student':
      return 'success'
    default:
      return 'secondary'
  }
}

const getSubscriptionSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'expired':
      return 'danger'
    case 'canceled':
      return 'warning'
    case 'past_due':
      return 'warning'
    default:
      return 'secondary'
  }
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
onMounted(() => {
  loadUser()
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
</style>
