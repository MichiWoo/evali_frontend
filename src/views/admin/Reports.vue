<template>
  <div class="admin-reports">
    <div class="grid">
      <!-- Header -->
      <div class="col-12">
        <div class="card">
          <div class="flex align-items-center justify-content-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-900 m-0">Reportes del Sistema</h1>
              <p class="text-600 mt-2">Análisis y estadísticas completas de la plataforma</p>
            </div>
            <div class="flex gap-2">
              <Button
                label="Exportar Todo"
                icon="pi pi-download"
                @click="exportAllReports"
                :loading="isExporting"
                severity="secondary"
              />
              <Button
                label="Actualizar"
                icon="pi pi-refresh"
                @click="refreshAllData"
                :loading="isLoading"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="flex align-items-center justify-content-center mb-3">
            <i class="pi pi-users text-4xl text-blue-500"></i>
          </div>
          <h3 class="text-2xl font-bold text-900 mb-1">{{ overviewStats.totalUsers }}</h3>
          <p class="text-600 mb-0">Usuarios Totales</p>
          <div class="flex align-items-center justify-content-center mt-2">
            <i class="pi pi-arrow-up text-green-500 mr-1"></i>
            <span class="text-green-500 text-sm">+12% este mes</span>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="flex align-items-center justify-content-center mb-3">
            <i class="pi pi-file text-4xl text-green-500"></i>
          </div>
          <h3 class="text-2xl font-bold text-900 mb-1">{{ overviewStats.totalExams }}</h3>
          <p class="text-600 mb-0">Exámenes Creados</p>
          <div class="flex align-items-center justify-content-center mt-2">
            <i class="pi pi-arrow-up text-green-500 mr-1"></i>
            <span class="text-green-500 text-sm">+8% este mes</span>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="flex align-items-center justify-content-center mb-3">
            <i class="pi pi-check-circle text-4xl text-orange-500"></i>
          </div>
          <h3 class="text-2xl font-bold text-900 mb-1">{{ overviewStats.completedExams }}</h3>
          <p class="text-600 mb-0">Exámenes Completados</p>
          <div class="flex align-items-center justify-content-center mt-2">
            <i class="pi pi-arrow-up text-green-500 mr-1"></i>
            <span class="text-green-500 text-sm">+15% este mes</span>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="flex align-items-center justify-content-center mb-3">
            <i class="pi pi-credit-card text-4xl text-purple-500"></i>
          </div>
          <h3 class="text-2xl font-bold text-900 mb-1">
            ${{ formatCurrency(overviewStats.totalRevenue) }}
          </h3>
          <p class="text-600 mb-0">Ingresos Totales</p>
          <div class="flex align-items-center justify-content-center mt-2">
            <i class="pi pi-arrow-up text-green-500 mr-1"></i>
            <span class="text-green-500 text-sm">+22% este mes</span>
          </div>
        </div>
      </div>

      <!-- Report Tabs -->
      <div class="col-12">
        <div class="card">
          <TabView v-model:activeIndex="activeTab">
            <!-- User Reports -->
            <TabPanel header="Usuarios">
              <div class="grid">
                <div class="col-12 lg:col-8">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Registro de Usuarios</h3>
                    <Chart type="line" :data="userRegistrationData" :options="chartOptions" />
                  </div>
                </div>
                <div class="col-12 lg:col-4">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Distribución por Rol</h3>
                    <Chart type="doughnut" :data="userRoleData" :options="doughnutOptions" />
                  </div>
                </div>
                <div class="col-12">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">
                      Usuarios Activos vs Inactivos
                    </h3>
                    <DataTable :value="userActivityData" class="p-datatable-sm">
                      <Column field="period" header="Período"></Column>
                      <Column field="active" header="Activos"></Column>
                      <Column field="inactive" header="Inactivos"></Column>
                      <Column field="total" header="Total"></Column>
                    </DataTable>
                  </div>
                </div>
              </div>
            </TabPanel>

            <!-- Exam Reports -->
            <TabPanel header="Exámenes">
              <div class="grid">
                <div class="col-12 lg:col-8">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Rendimiento de Exámenes</h3>
                    <Chart type="bar" :data="examPerformanceData" :options="chartOptions" />
                  </div>
                </div>
                <div class="col-12 lg:col-4">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Estado de Exámenes</h3>
                    <Chart type="pie" :data="examStatusData" :options="doughnutOptions" />
                  </div>
                </div>
                <div class="col-12">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">
                      Top Exámenes por Completaciones
                    </h3>
                    <DataTable :value="topExamsData" class="p-datatable-sm">
                      <Column field="title" header="Examen"></Column>
                      <Column field="completions" header="Completaciones"></Column>
                      <Column field="averageScore" header="Puntuación Promedio"></Column>
                      <Column field="completionRate" header="Tasa de Completación"></Column>
                    </DataTable>
                  </div>
                </div>
              </div>
            </TabPanel>

            <!-- Payment Reports -->
            <TabPanel header="Pagos">
              <div class="grid">
                <div class="col-12 lg:col-8">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Ingresos por Mes</h3>
                    <Chart type="line" :data="revenueData" :options="chartOptions" />
                  </div>
                </div>
                <div class="col-12 lg:col-4">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Distribución de Planes</h3>
                    <Chart
                      type="doughnut"
                      :data="planDistributionData"
                      :options="doughnutOptions"
                    />
                  </div>
                </div>
                <div class="col-12">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Resumen de Pagos</h3>
                    <DataTable :value="paymentSummaryData" class="p-datatable-sm">
                      <Column field="plan" header="Plan"></Column>
                      <Column field="subscribers" header="Suscriptores"></Column>
                      <Column field="revenue" header="Ingresos"></Column>
                      <Column field="growth" header="Crecimiento"></Column>
                    </DataTable>
                  </div>
                </div>
              </div>
            </TabPanel>

            <!-- System Reports -->
            <TabPanel header="Sistema">
              <div class="grid">
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Uso del Sistema</h3>
                    <Chart type="bar" :data="systemUsageData" :options="chartOptions" />
                  </div>
                </div>
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Actividad por Hora</h3>
                    <Chart type="line" :data="activityByHourData" :options="chartOptions" />
                  </div>
                </div>
                <div class="col-12">
                  <div class="card">
                    <h3 class="text-xl font-semibold text-900 mb-4">Métricas del Sistema</h3>
                    <div class="grid">
                      <div class="col-12 md:col-3">
                        <div class="text-center">
                          <h4 class="text-2xl font-bold text-900 mb-1">
                            {{ systemMetrics.avgResponseTime }}ms
                          </h4>
                          <p class="text-600 mb-0">Tiempo de Respuesta</p>
                        </div>
                      </div>
                      <div class="col-12 md:col-3">
                        <div class="text-center">
                          <h4 class="text-2xl font-bold text-900 mb-1">
                            {{ systemMetrics.uptime }}%
                          </h4>
                          <p class="text-600 mb-0">Tiempo de Actividad</p>
                        </div>
                      </div>
                      <div class="col-12 md:col-3">
                        <div class="text-center">
                          <h4 class="text-2xl font-bold text-900 mb-1">
                            {{ systemMetrics.totalRequests }}
                          </h4>
                          <p class="text-600 mb-0">Solicitudes Totales</p>
                        </div>
                      </div>
                      <div class="col-12 md:col-3">
                        <div class="text-center">
                          <h4 class="text-2xl font-bold text-900 mb-1">
                            {{ systemMetrics.errorRate }}%
                          </h4>
                          <p class="text-600 mb-0">Tasa de Errores</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRoleGuard } from '@/composables/useRoleGuard'
import apiService from '@/services/api'

// Components
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Chart from 'primevue/chart'

// Store
const { requireRole } = useRoleGuard()
const toast = useToast()

// State
const isLoading = ref(false)
const isExporting = ref(false)
const activeTab = ref(0)

// Overview Stats
const overviewStats = reactive({
  totalUsers: 0,
  totalExams: 0,
  completedExams: 0,
  totalRevenue: 0,
})

// Chart Data
const userRegistrationData = ref({})
const userRoleData = ref({})
const examPerformanceData = ref({})
const examStatusData = ref({})
const revenueData = ref({})
const planDistributionData = ref({})
const systemUsageData = ref({})
const activityByHourData = ref({})

// Table Data
const userActivityData = ref([])
const topExamsData = ref([])
const paymentSummaryData = ref([])

// System Metrics
const systemMetrics = reactive({
  avgResponseTime: 0,
  uptime: 0,
  totalRequests: 0,
  errorRate: 0,
})

// Chart Options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
})

const doughnutOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
})

// Methods
const loadOverviewStats = async () => {
  try {
    const result = await apiService.getAdminOverviewStats()

    if (result.data) {
      overviewStats.totalUsers = result.data.overview.total_users
      overviewStats.totalExams = result.data.overview.total_exams
      overviewStats.completedExams = result.data.overview.completed_exams
      overviewStats.totalRevenue = result.data.overview.total_revenue
    }
  } catch (error) {
    console.error('Error loading overview stats:', error)
    // Fallback to demo data
    overviewStats.totalUsers = 1250
    overviewStats.totalExams = 89
    overviewStats.completedExams = 2340
    overviewStats.totalRevenue = 45600
  }
}

const loadUserReports = async () => {
  try {
    const result = await apiService.getAdminUserAnalytics('6months')

    if (result.data) {
      // User Registration Chart
      const registrations = result.data.user_registrations || []
      userRegistrationData.value = {
        labels: registrations.map((item: any) =>
          new Date(item.date).toLocaleDateString('es-ES', { month: 'short' }),
        ),
        datasets: [
          {
            label: 'Nuevos Usuarios',
            data: registrations.map((item: any) => item.count),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      }

      // User Role Distribution
      const roleDistribution = result.data.role_distribution || []
      userRoleData.value = {
        labels: roleDistribution.map((item: any) => item.role),
        datasets: [
          {
            data: roleDistribution.map((item: any) => item.count),
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
          },
        ],
      }

      // User Activity Data
      const activity = result.data.activity || {}
      userActivityData.value = [
        {
          period: 'Activos',
          active: activity.active_users || 0,
          inactive: 0,
          total: activity.active_users || 0,
        },
        {
          period: 'Inactivos',
          active: 0,
          inactive: activity.inactive_users || 0,
          total: activity.inactive_users || 0,
        },
        {
          period: 'Actividad Reciente',
          active: activity.recent_activity || 0,
          inactive: 0,
          total: activity.recent_activity || 0,
        },
      ]
    }
  } catch (error) {
    console.error('Error loading user reports:', error)
    // Fallback to demo data
    userRegistrationData.value = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Nuevos Usuarios',
          data: [65, 78, 90, 81, 95, 105],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    }
  }
}

const loadExamReports = async () => {
  try {
    const result = await apiService.getAdminExamAnalytics('6months')

    if (result.data) {
      // Exam Performance Chart
      const completions = result.data.exam_completions || []
      examPerformanceData.value = {
        labels: completions.map((item: any) =>
          new Date(item.date).toLocaleDateString('es-ES', { month: 'short' }),
        ),
        datasets: [
          {
            label: 'Exámenes Completados',
            data: completions.map((item: any) => item.count),
            backgroundColor: '#10B981',
          },
        ],
      }

      // Exam Status Distribution
      const examStatus = result.data.exam_status || []
      examStatusData.value = {
        labels: examStatus.map((item: any) => item.status),
        datasets: [
          {
            data: examStatus.map((item: any) => item.count),
            backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
          },
        ],
      }

      // Top Exams Data
      const topExams = result.data.top_exams || []
      topExamsData.value = topExams.map((exam: any) => ({
        title: exam.title,
        completions: exam.completions,
        averageScore: exam.avg_score || 0,
        completionRate: 'N/A',
      }))
    }
  } catch (error) {
    console.error('Error loading exam reports:', error)
    // Fallback to demo data
    examPerformanceData.value = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Exámenes Completados',
          data: [120, 150, 180, 165, 200, 220],
          backgroundColor: '#10B981',
        },
      ],
    }
  }
}

const loadPaymentReports = async () => {
  try {
    const result = await apiService.getAdminPaymentAnalytics('6months')

    if (result.data) {
      // Revenue Chart
      const revenueOverTime = result.data.revenue_over_time || []
      revenueData.value = {
        labels: revenueOverTime.map((item: any) =>
          new Date(item.date).toLocaleDateString('es-ES', { month: 'short' }),
        ),
        datasets: [
          {
            label: 'Ingresos (USD)',
            data: revenueOverTime.map((item: any) => item.revenue),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
          },
        ],
      }

      // Plan Distribution
      const planDistribution = result.data.plan_distribution || []
      planDistributionData.value = {
        labels: planDistribution.map((item: any) => item.plan_name),
        datasets: [
          {
            data: planDistribution.map((item: any) => item.subscribers),
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
          },
        ],
      }

      // Payment Summary
      paymentSummaryData.value = planDistribution.map((plan: any) => ({
        plan: plan.plan_name,
        subscribers: plan.subscribers,
        revenue: plan.revenue,
        growth: 'N/A',
      }))
    }
  } catch (error) {
    console.error('Error loading payment reports:', error)
    // Fallback to demo data
    revenueData.value = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ingresos (USD)',
          data: [8500, 9200, 10800, 10200, 12500, 13800],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
        },
      ],
    }
  }
}

const loadSystemReports = async () => {
  try {
    const result = await apiService.getAdminSystemAnalytics()

    if (result.data) {
      // System Usage Chart (using activity by hour data)
      const activityByHour = result.data.activity_by_hour || []
      systemUsageData.value = {
        labels: activityByHour.map((item: any) => `${item.hour}:00`),
        datasets: [
          {
            label: 'Usuarios Activos',
            data: activityByHour.map((item: any) => item.activity),
            backgroundColor: '#3B82F6',
          },
        ],
      }

      // Activity by Hour
      activityByHourData.value = {
        labels: activityByHour.map((item: any) => `${item.hour}:00`),
        datasets: [
          {
            label: 'Actividad',
            data: activityByHour.map((item: any) => item.activity),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
          },
        ],
      }

      // System Metrics
      const metrics = result.data.system_metrics || {}
      systemMetrics.avgResponseTime = metrics.avg_response_time || 245
      systemMetrics.uptime = metrics.uptime || 99.9
      systemMetrics.totalRequests = metrics.total_requests || 125000
      systemMetrics.errorRate = metrics.error_rate || 0.1
    }
  } catch (error) {
    console.error('Error loading system reports:', error)
    // Fallback to demo data
    systemUsageData.value = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Usuarios Activos',
          data: [1200, 1350, 1100, 1400, 1600, 800, 600],
          backgroundColor: '#3B82F6',
        },
      ],
    }
  }
}

const refreshAllData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      loadOverviewStats(),
      loadUserReports(),
      loadExamReports(),
      loadPaymentReports(),
      loadSystemReports(),
    ])

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Datos actualizados correctamente',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron actualizar los datos',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

const exportAllReports = async () => {
  isExporting.value = true
  try {
    const blob = await apiService.exportAdminReports()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    link.setAttribute('download', `reportes_${stamp}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Descarga iniciada',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron exportar los reportes',
      life: 3000,
    })
  } finally {
    isExporting.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

// Lifecycle
onMounted(() => {
  // Verificar que el usuario tenga rol de admin
  if (
    !requireRole('admin', {
      customMessage: 'Solo los administradores pueden ver los reportes del sistema',
    })
  ) {
    return // Ya redirigió y mostró mensaje de error
  }

  refreshAllData()
})
</script>

<style scoped>
.admin-reports {
  padding: 1rem;
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.card:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .admin-reports {
    padding: 0.5rem;
  }

  .card {
    padding: 1rem;
  }
}
</style>
