<template>
  <div class="role-redirect">
    <div class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Redirigiendo...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const redirectAttempted = ref(false)

onMounted(async () => {
  console.log('RoleRedirect mounted - starting redirection process')

  // Initialize auth first (now async)
  await authStore.initializeAuth()

  // Wait a moment for auth to be fully initialized
  await new Promise((resolve) => setTimeout(resolve, 100))

  console.log('RoleRedirect - user:', authStore.user)
  console.log('RoleRedirect - isAuthenticated:', authStore.isAuthenticated)
  console.log('RoleRedirect - userRole:', authStore.userRole)

  if (!authStore.isAuthenticated) {
    console.log('RoleRedirect - user not authenticated, redirecting to login')
    router.push('/login')
    redirectAttempted.value = true
    return
  }

  // Si todavía no tiene rol, intentar obtener el perfil nuevamente
  if (!authStore.userRole) {
    console.log('RoleRedirect - user has no role, trying to refresh profile...')
    try {
      await authStore.getProfile()
      await new Promise((resolve) => setTimeout(resolve, 100))
      console.log('RoleRedirect - after refresh, userRole:', authStore.userRole)
    } catch (error) {
      console.error('RoleRedirect - error refreshing profile:', error)
      authStore.clearAuth()
      router.push('/login')
      redirectAttempted.value = true
      return
    }
  }

  // Redirect based on user role
  if (authStore.isStudent) {
    console.log('RoleRedirect - redirecting student to student dashboard')
    router.push('/student/dashboard')
  } else if (authStore.isTeacher || authStore.isAdmin) {
    console.log('RoleRedirect - redirecting teacher/admin to dashboard')
    router.push('/dashboard')
  } else {
    console.log('RoleRedirect - no valid role found, redirecting to login')
    authStore.clearAuth()
    router.push('/login')
  }
  redirectAttempted.value = true
})
</script>

<style scoped>
.role-redirect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.loading i {
  font-size: 2rem;
  color: var(--primary-color);
}

.loading p {
  margin: 0;
  font-size: 1rem;
}
</style>
