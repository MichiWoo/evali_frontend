<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Message from 'primevue/message'

// Router y stores
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref(false)
const isVerifying = ref(true)
const isVerified = ref(false)
const verificationError = ref('')
const _emailFromUrl = ref('')

// Obtener parámetros de la URL
const idFromUrl = ref('')
const hashFromUrl = ref('')

onMounted(async () => {
  // Obtener id y hash de los query parameters
  idFromUrl.value = route.query.id?.toString() || ''
  hashFromUrl.value = route.query.hash?.toString() || ''

  // Si tenemos los parámetros, verificar automáticamente
  if (idFromUrl.value && hashFromUrl.value) {
    await verifyEmail()
  } else {
    isVerifying.value = false
    verificationError.value =
      'El enlace de verificación no es válido. Faltan parámetros necesarios.'
  }
})

const verifyEmail = async () => {
  if (!idFromUrl.value || !hashFromUrl.value) {
    verificationError.value = 'El enlace de verificación no es válido.'
    isVerifying.value = false
    return
  }

  try {
    isLoading.value = true
    isVerifying.value = true
    verificationError.value = ''

    const result = await authStore.verifyEmail(idFromUrl.value, hashFromUrl.value)

    if (result && result.success) {
      isVerified.value = true
      toast.add({
        severity: 'success',
        summary: '¡Email verificado!',
        detail: result.data?.message || 'Tu correo electrónico ha sido verificado exitosamente.',
        life: 5000,
      })

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login?verified=1')
      }, 3000)
    } else {
      verificationError.value = result?.error || 'Error al verificar el correo electrónico'
    }
  } catch (_error) {
    console.error('Verify email error:', error)

    let errorMessage = 'Ha ocurrido un error al verificar tu correo electrónico'

    // Extraer el mensaje de error del backend
    if (error.response) {
      const status = error.response.status
      const responseData = error.response.data

      // Error 400: Enlace inválido
      if (status === 400) {
        if (responseData.error?.message) {
          errorMessage = responseData.error.message
        } else if (responseData.message) {
          errorMessage = responseData.message
        } else {
          errorMessage = 'El enlace de verificación no es válido o ha expirado.'
        }
      }
      // Error 404: Usuario no encontrado
      else if (status === 404) {
        errorMessage = 'Usuario no encontrado.'
      }
      // Error 422: Ya verificado
      else if (status === 422) {
        if (responseData.data?.message) {
          errorMessage = responseData.data.message
          // Si ya está verificado, mostrar como éxito
          isVerified.value = true
        }
      }
      // Error 500: Error del servidor
      else if (status >= 500) {
        errorMessage = 'Error del servidor. Por favor intenta más tarde.'
      }
      // Error de red
      else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.'
      }
    }

    verificationError.value = errorMessage
  } finally {
    isLoading.value = false
    isVerifying.value = false
  }
}

const handleResendVerification = async () => {
  try {
    isLoading.value = true
    await authStore.sendVerificationEmail()
    toast.add({
      severity: 'success',
      summary: 'Correo enviado',
      detail: 'Se ha enviado un nuevo enlace de verificación a tu correo electrónico.',
      life: 5000,
    })
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al enviar el correo de verificación. Por favor intenta más tarde.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const handleGoToLogin = () => {
  router.push('/login')
}

const handleGoToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="verify-email-container">
    <div class="verify-email-card">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="logo-container mb-4">
          <i
            :class="
              isVerified
                ? 'pi pi-check-circle text-6xl text-green-500'
                : 'pi pi-envelope text-6xl text-primary'
            "
          ></i>
        </div>
        <h1 class="text-3xl font-bold text-900 mb-2">
          {{ isVerified ? '¡Email Verificado!' : 'Verificar Email' }}
        </h1>
        <p class="text-600 text-lg">
          {{
            isVerified
              ? 'Tu cuenta ha sido activada exitosamente'
              : 'Verificando tu correo electrónico...'
          }}
        </p>
      </div>

      <!-- Estado de verificación -->
      <div v-if="isVerifying" class="text-center mb-4">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        <p class="mt-3 text-600">Por favor espera mientras verificamos tu correo...</p>
      </div>

      <!-- Mensaje de éxito -->
      <Message v-if="isVerified && !isVerifying" severity="success" :closable="false" class="mb-4">
        <div class="flex flex-column gap-2">
          <p class="m-0 font-semibold">¡Verificación exitosa!</p>
          <p class="m-0 text-sm">
            Tu correo electrónico ha sido verificado correctamente. Ahora puedes iniciar sesión en
            tu cuenta.
          </p>
          <p class="m-0 text-sm text-600">Serás redirigido al login en unos segundos...</p>
        </div>
      </Message>

      <!-- Mensaje de error -->
      <Message
        v-if="verificationError && !isVerifying"
        severity="error"
        :closable="false"
        class="mb-4"
      >
        <div class="flex flex-column gap-2">
          <p class="m-0 font-semibold">{{ verificationError }}</p>
          <p class="m-0 text-sm text-600">
            Si necesitas un nuevo enlace de verificación, puedes solicitarlo desde el login o
            registrarte nuevamente.
          </p>
        </div>
      </Message>

      <!-- Botones de acción -->
      <div class="flex flex-column gap-3 mt-4">
        <Button v-if="isVerified" label="Ir al Login" class="w-full" @click="handleGoToLogin" />

        <template v-else-if="verificationError">
          <Button
            label="Solicitar Nuevo Enlace"
            class="w-full mb-2"
            @click="handleResendVerification"
            :loading="isLoading"
            :disabled="isLoading"
          />
          <Button label="Ir al Login" class="w-full p-button-outlined" @click="handleGoToLogin" />
          <Button
            label="Registrarse"
            class="w-full p-button-link p-0"
            @click="handleGoToRegister"
          />
        </template>

        <template v-else>
          <Button label="Ir al Login" class="w-full" @click="handleGoToLogin" />
        </template>
      </div>

      <!-- Información adicional -->
      <div class="text-center mt-6">
        <p class="text-600 text-sm">
          ¿Necesitas ayuda?
          <a href="/support" class="text-primary no-underline">Contacta con soporte</a>
        </p>
      </div>
    </div>
    <Toast />
  </div>
</template>

<style scoped>
.verify-email-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.verify-email-card {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--surface-border);
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: var(--primary-50);
  border-radius: 50%;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 480px) {
  .verify-email-container {
    padding: 1rem;
  }

  .verify-email-card {
    padding: 2rem;
  }
}
</style>
