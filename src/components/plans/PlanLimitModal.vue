<template>
  <Dialog
    :visible="modelValue"
    @update:visible="updateVisible"
    modal
    :style="{ width: '500px' }"
    :header="title"
    :closable="true"
    @hide="onClose"
  >
    <div class="flex flex-column gap-4">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
        <div class="flex flex-column">
          <p class="text-lg font-semibold m-0">{{ message }}</p>
          <p class="text-muted-color m-0 mt-2">{{ description }}</p>
        </div>
      </div>

      <div
        v-if="limitInfo && limitInfo.limit > 0"
        class="p-3 border-round surface-100 dark:surface-800"
      >
        <div class="flex justify-content-between align-items-center mb-2">
          <span class="text-sm font-medium">Uso actual:</span>
          <span class="text-sm font-bold">{{ limitInfo.current }} / {{ limitInfo.limit }}</span>
        </div>
        <ProgressBar
          :value="Math.min((limitInfo.current / limitInfo.limit) * 100, 100)"
          :showValue="false"
          class="h-1rem"
        />
      </div>

      <div class="p-3 border-round surface-50 dark:surface-900">
        <p class="text-sm m-0">
          <i class="pi pi-info-circle mr-2"></i>
          Actualiza tu plan para crear más {{ resourceType }} y desbloquear todas las
          funcionalidades.
        </p>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" outlined @click="onClose" />
      <Button label="Ver Planes" icon="pi pi-arrow-right" @click="goToPlans" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  description?: string
  resourceType?: string
  limitInfo?: {
    current: number
    limit: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Límite de Plan Alcanzado',
  message: 'Has alcanzado el límite de tu plan actual',
  description: 'Tu plan actual tiene límites en la cantidad de recursos que puedes crear.',
  resourceType: 'recursos',
  limitInfo: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

const onClose = () => {
  emit('update:modelValue', false)
}

const goToPlans = () => {
  emit('update:modelValue', false)
  router.push('/plans')
}
</script>

<style scoped>
:deep(.p-dialog-header) {
  background: var(--orange-50);
  border-bottom: 2px solid var(--orange-200);
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}
</style>
