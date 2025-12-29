<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptions'
import type { Plan } from '@/types'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()

// Obtener solo planes mensuales
const monthlyPlans = computed(() => {
  const allPlans = subscriptionStore.plans || []
  // Filtrar solo planes mensuales (excluir anuales)
  return allPlans.filter((plan) => plan.interval === 'monthly' || plan.slug === 'free')
})

// Ordenar planes: free, basic, professional, enterprise
const sortedPlans = computed(() => {
  const order = ['free', 'basic', 'professional', 'enterprise']
  return [...monthlyPlans.value].sort((a, b) => {
    const indexA = order.indexOf(a.slug)
    const indexB = order.indexOf(b.slug)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })
})

onMounted(async () => {
  await subscriptionStore.fetchPlans()
})

const formatPrice = (priceCents: number, currency: string = 'MXN') => {
  const price = priceCents / 100
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

const getPlanIcon = (slug: string) => {
  const icons: Record<string, string> = {
    free: 'pi-gift',
    basic: 'pi-rocket',
    professional: 'pi-briefcase',
    enterprise: 'pi-building',
  }
  return icons[slug] || 'pi-star'
}

const getPlanIconColor = (slug: string) => {
  const colors: Record<string, string> = {
    free: 'text-cyan-500',
    basic: 'text-blue-500',
    professional: 'text-purple-500',
    enterprise: 'text-orange-500',
  }
  return colors[slug] || 'text-gray-500'
}

const getPlanFeatures = (plan: Plan) => {
  const features = []
  const maxGroups = plan.max_groups === null ? 'Ilimitados' : plan.max_groups
  const maxExams = plan.max_exams === null ? 'Ilimitados' : plan.max_exams
  const maxStudents = plan.max_students === null ? 'Ilimitados' : plan.max_students

  features.push(`${maxGroups} grupo${maxGroups !== 'Ilimitados' && maxGroups !== 1 ? 's' : ''}`)
  features.push(`${maxExams} examen${maxExams !== 'Ilimitados' && maxExams !== 1 ? 'es' : ''}`)
  features.push(
    `${maxStudents} estudiante${maxStudents !== 'Ilimitados' && maxStudents !== 1 ? 's' : ''}`,
  )

  if (plan.features.ai_evaluation) {
    features.push('Evaluación con IA')
  }
  if (plan.features.advanced_reports) {
    features.push('Reportes avanzados')
  }
  if (plan.features.api_access) {
    features.push('Acceso a API')
  }
  if (plan.features.priority_support) {
    features.push('Soporte prioritario')
  }
  if (plan.features.custom_branding) {
    features.push('Marca personalizada')
  }

  return features
}

const handleGetStarted = () => {
  router.push('/register')
}
</script>

<template>
  <div id="pricing" class="py-6 px-6 lg:px-20 my-2 md:my-6">
    <div class="text-center mb-6">
      <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">
        Planes y Precios
      </div>
      <span class="text-muted-color text-2xl">Elige el plan perfecto para tus necesidades</span>
    </div>

    <div v-if="subscriptionStore.loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      <p class="mt-4 text-surface-600 dark:text-surface-200">Cargando planes...</p>
    </div>

    <div v-else class="grid grid-cols-12 gap-4 justify-between mt-20 md:mt-0">
      <div v-for="plan in sortedPlans" :key="plan.id" class="col-span-12 lg:col-span-3 p-0 md:p-4">
        <div
          class="p-4 flex flex-col border-surface-200 dark:border-surface-600 pricing-card cursor-pointer border-2 hover:border-primary duration-300 transition-all h-full"
          style="border-radius: 10px"
        >
          <div class="text-surface-900 dark:text-surface-0 text-center my-8 text-3xl">
            {{ plan.name }}
          </div>
          <div class="flex justify-center my-4">
            <i :class="`pi ${getPlanIcon(plan.slug)} text-6xl ${getPlanIconColor(plan.slug)}`"></i>
          </div>
          <div class="my-8 flex flex-col items-center gap-4">
            <div class="flex items-center">
              <span class="text-5xl font-bold mr-2 text-surface-900 dark:text-surface-0">
                {{ formatPrice(plan.price_cents, plan.currency) }}
              </span>
              <span class="text-surface-600 dark:text-surface-200">/mes</span>
            </div>
            <p
              v-if="plan.features.description"
              class="text-center text-sm text-surface-600 dark:text-surface-200 px-4"
            >
              {{ plan.features.description }}
            </p>
            <Button
              label="Comenzar"
              @click="handleGetStarted"
              class="p-button-rounded border-0 ml-4 font-light leading-tight bg-blue-500 text-white w-full"
            ></Button>
          </div>
          <Divider class="w-full bg-surface-200"></Divider>
          <ul class="my-8 list-none p-0 flex text-surface-900 dark:text-surface-0 flex-col px-8">
            <li v-for="(feature, index) in getPlanFeatures(plan)" :key="index" class="py-2">
              <i class="pi pi-fw pi-check text-xl text-cyan-500 mr-2"></i>
              <span class="text-xl leading-normal">{{ feature }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
