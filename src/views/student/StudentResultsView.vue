<template>
  <div class="student-results-view">
    <!-- Header -->
    <div class="header-section mb-4">
      <div class="flex align-items-center justify-content-between">
        <div>
          <h1 class="text-3xl font-bold text-900 mb-2">Mis Resultados</h1>
          <p class="text-600 m-0">
            Revisa tus calificaciones y desempeño en los exámenes completados
          </p>
        </div>
        <Button
          label="Ver Exámenes"
          icon="pi pi-file"
          severity="secondary"
          outlined
          @click="$router.push('/student/exams')"
        />
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid mb-4">
      <div class="stat-card stat-total">
        <div class="stat-icon">
          <i class="pi pi-chart-bar text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <div class="stat-card stat-excellent">
        <div class="stat-icon">
          <i class="pi pi-check-circle text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.excellent }}</div>
          <div class="stat-label">Excelentes (≥90%)</div>
        </div>
      </div>
      <div class="stat-card stat-good">
        <div class="stat-icon">
          <i class="pi pi-thumbs-up text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.good }}</div>
          <div class="stat-label">Buenos (≥70%)</div>
        </div>
      </div>
      <div class="stat-card stat-average">
        <div class="stat-icon">
          <i class="pi pi-percentage text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ averagePercentage }}%</div>
          <div class="stat-label">Promedio</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-container mb-4">
      <div class="filter-buttons">
        <Button
          label="Todos"
          :icon="'pi pi-list'"
          :class="{ 'p-button-primary': activeTab === 0, 'p-button-outlined': activeTab !== 0 }"
          @click="activeTab = 0"
        />
        <Button
          :label="`Excelentes (${excellentResults.length})`"
          :icon="'pi pi-check-circle'"
          :class="{ 'p-button-primary': activeTab === 1, 'p-button-outlined': activeTab !== 1 }"
          @click="activeTab = 1"
        />
        <Button
          :label="`Buenos (${goodResults.length})`"
          :icon="'pi pi-thumbs-up'"
          :class="{ 'p-button-primary': activeTab === 2, 'p-button-outlined': activeTab !== 2 }"
          @click="activeTab = 2"
        />
        <Button
          :label="`Regulares (${regularResults.length})`"
          :icon="'pi pi-exclamation-circle'"
          :class="{ 'p-button-primary': activeTab === 3, 'p-button-outlined': activeTab !== 3 }"
          @click="activeTab = 3"
        />
        <Button
          :label="`Mejorar (${lowResults.length})`"
          :icon="'pi pi-times-circle'"
          :class="{ 'p-button-primary': activeTab === 4, 'p-button-outlined': activeTab !== 4 }"
          @click="activeTab = 4"
        />
      </div>
    </div>

    <!-- Contenido según tab activo -->
    <div class="content-container">
      <ResultList
        v-if="activeTab === 0"
        :results="allResults"
        :isLoading="isLoading"
        :emptyMessage="'No has completado ningún examen aún'"
        @view-details="handleViewDetails"
      />
      <ResultList
        v-else-if="activeTab === 1"
        :results="excellentResults"
        :isLoading="isLoading"
        :emptyMessage="'No tienes resultados excelentes aún'"
        @view-details="handleViewDetails"
      />
      <ResultList
        v-else-if="activeTab === 2"
        :results="goodResults"
        :isLoading="isLoading"
        :emptyMessage="'No tienes resultados buenos aún'"
        @view-details="handleViewDetails"
      />
      <ResultList
        v-else-if="activeTab === 3"
        :results="regularResults"
        :isLoading="isLoading"
        :emptyMessage="'No tienes resultados regulares'"
        @view-details="handleViewDetails"
      />
      <ResultList
        v-else
        :results="lowResults"
        :isLoading="isLoading"
        :emptyMessage="'No tienes resultados que mejorar'"
        @view-details="handleViewDetails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import ResultList from './components/ResultList.vue'

const router = useRouter()
const toast = useToast()

// State
const isLoading = ref(false)
const activeTab = ref(0)
const results = ref<any[]>([])

// Computed - Filtrar resultados por categoría
const allResults = computed(() => {
  return results.value
})

const excellentResults = computed(() => {
  return results.value.filter((result) => result.percentage >= 90)
})

const goodResults = computed(() => {
  return results.value.filter((result) => result.percentage >= 70 && result.percentage < 90)
})

const regularResults = computed(() => {
  return results.value.filter((result) => result.percentage >= 50 && result.percentage < 70)
})

const lowResults = computed(() => {
  return results.value.filter((result) => result.percentage < 50)
})

const stats = computed(() => {
  return {
    total: results.value.length,
    excellent: excellentResults.value.length,
    good: goodResults.value.length,
    regular: regularResults.value.length,
    low: lowResults.value.length,
  }
})

const averagePercentage = computed(() => {
  if (results.value.length === 0) return 0
  const sum = results.value.reduce((acc, result) => acc + (result.percentage || 0), 0)
  return Math.round(sum / results.value.length)
})

// Methods
const loadResults = async () => {
  try {
    isLoading.value = true

    console.log('Loading results...')

    const resultsResponse: any = await api.getStudentResults()
    console.log('Results response:', resultsResponse)

    if (resultsResponse) {
      if (resultsResponse.success && resultsResponse.data) {
        // El backend devuelve paginación: { success: true, data: { data: [...], current_page: ..., total: ... } }
        const paginatedData = resultsResponse.data
        if (paginatedData.data && Array.isArray(paginatedData.data)) {
          results.value = paginatedData.data
        } else if (Array.isArray(paginatedData)) {
          results.value = paginatedData
        }
      } else if (resultsResponse.data) {
        const responseData = resultsResponse.data
        if (responseData.data && Array.isArray(responseData.data)) {
          results.value = responseData.data
        } else if (Array.isArray(responseData)) {
          results.value = responseData
        }
      } else if (Array.isArray(resultsResponse)) {
        results.value = resultsResponse
      }
    }

    console.log('Loaded results:', results.value.length, results.value)
  } catch (error: any) {
    console.error('Error loading results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los resultados. Intenta nuevamente.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const handleViewDetails = (result: any) => {
  // Navegar a la vista de detalles del resultado
  router.push(`/student/results/${result.id}`)
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.student-results-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
  color: var(--primary-600);
}

.stat-excellent .stat-icon {
  background: linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%);
  color: var(--green-600);
}

.stat-good .stat-icon {
  background: linear-gradient(135deg, var(--blue-100) 0%, var(--blue-200) 100%);
  color: var(--blue-600);
}

.stat-average .stat-icon {
  background: linear-gradient(135deg, var(--purple-100) 0%, var(--purple-200) 100%);
  color: var(--purple-600);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

.filters-container {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.content-container {
  min-height: 400px;
}

@media (max-width: 768px) {
  .student-results-view {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-buttons .p-button {
    width: 100%;
  }
}
</style>
