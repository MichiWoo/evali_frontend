<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGroupStore } from '@/stores/groups'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import axios from 'axios'
import type { Group } from '@/types'

// Components
import ConfirmDialog from 'primevue/confirmdialog'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import PlanLimitModal from '@/components/plans/PlanLimitModal.vue'

// Router
const router = useRouter()
const route = useRoute()

// Store
const groupStore = useGroupStore()
const subscriptionStore = useSubscriptionStore()
const confirm = useConfirm()
const toast = useToast()

// Estado local del componente
const selectedGroups = ref([])
const filters = ref({
  search: '',
  status: '',
  teacher: '',
  dateRange: null,
})

// Estado para acciones masivas
const showBulkActions = computed(() => selectedGroups.value.length > 0)
const isProcessingBulkAction = ref(false)

// Estado para vista de administración
const isAdminView = computed(() => route.name === 'groups-manage')
const showAdvancedFilters = ref(false)

// Estado para modal de límite de plan
const showPlanLimitModal = ref(false)

// Opciones para filtros avanzados
const statusOptions = ref([
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Pendiente', value: 'pending' },
])

const teacherOptions = ref([
  // TODO: Cargar desde API de usuarios
  { label: 'Profesor 1', value: 1 },
  { label: 'Profesor 2', value: 2 },
])

// Computed
const filteredGroups = computed(() => {
  let filtered = groupStore.groups

  // Filtro de búsqueda general (busca en todos los campos)
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (group) =>
        (group.name && group.name.toLowerCase().includes(search)) ||
        (group.description && group.description.toLowerCase().includes(search)) ||
        (group.status && group.status.toLowerCase().includes(search)),
    )
  }

  return filtered
})

// Computed para filtros activos
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search ||
    filters.value.status ||
    filters.value.teacher ||
    filters.value.dateRange
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.status) count++
  if (filters.value.teacher) count++
  if (filters.value.dateRange) count++
  return count
})

// Estadísticas globales (solo para vista de admin)
const groupStats = computed(() => {
  if (!isAdminView.value) return null

  const groups = groupStore.groups
  const totalGroups = groups.length

  const activeGroups = groups.filter((g) => g.status === 'active').length
  const inactiveGroups = groups.filter((g) => g.status === 'inactive').length
  const pendingGroups = groups.filter((g) => g.status === 'pending').length

  const totalStudents = groups.reduce((sum, group) => sum + (group.users?.length || 0), 0)
  const totalExams = groups.reduce((sum, group) => sum + (group.exams?.length || 0), 0)

  const avgStudentsPerGroup =
    totalGroups > 0 ? Math.round((totalStudents / totalGroups) * 10) / 10 : 0
  const avgExamsPerGroup = totalGroups > 0 ? Math.round((totalExams / totalGroups) * 10) / 10 : 0

  // Grupos más activos (con más estudiantes)
  const mostActiveGroups = groups
    .filter((g) => g.users && g.users.length > 0)
    .sort((a, b) => (b.users?.length || 0) - (a.users?.length || 0))
    .slice(0, 3)

  // Grupos recientes (últimos 7 días)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentGroups = groups.filter((g) => new Date(g.created_at) >= sevenDaysAgo).length

  return {
    totalGroups,
    activeGroups,
    inactiveGroups,
    pendingGroups,
    totalStudents,
    totalExams,
    avgStudentsPerGroup,
    avgExamsPerGroup,
    mostActiveGroups,
    recentGroups,
  }
})

// Métodos
const loadGroups = async () => {
  try {
    await groupStore.fetchGroups()
  } catch (error) {
    console.error('Error loading groups:', error)
  }
}

const goToCreateGroup = async () => {
  // Verificar límites del plan antes de permitir crear grupo
  await subscriptionStore.fetchUsage()

  if (!subscriptionStore.canCreateGroup) {
    // Mostrar modal de advertencia
    showPlanLimitModal.value = true
    return
  }

  router.push('/groups/create')
}

const viewGroup = (group: Group) => {
  router.push(`/groups/${group.id}`)
}

const editGroup = (group: Group) => {
  router.push(`/groups/${group.id}/edit`)
}

const deleteGroup = (group: Group) => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar el grupo "${group.name}"? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await groupStore.deleteGroup(group.id)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Grupo eliminado correctamente',
        })
      } catch (error) {
        console.error('Error deleting group:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el grupo',
        })
      }
    },
  })
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'inactive':
      return 'Inactivo'
    case 'archived':
      return 'Archivado'
    default:
      return status
  }
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'warning'
    case 'archived':
      return 'secondary'
    default:
      return 'info'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Función específica para formateo de fechas en CSV
const formatDateForCSV = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const clearFilters = () => {
  // Limpiar todos los filtros
  filters.value.search = ''
  filters.value.status = ''
  filters.value.teacher = ''
  filters.value.dateRange = null
}

const applyAdvancedFilters = () => {
  // Los filtros se aplican automáticamente a través del computed filteredGroups
  toast.add({
    severity: 'info',
    summary: 'Filtros aplicados',
    detail: 'Los filtros avanzados han sido aplicados',
  })
}

// Acciones de Gestión (Solo para Admin)
const duplicateGroup = (group: Group) => {
  confirm.require({
    message: `¿Estás seguro de que quieres duplicar el grupo "${group.name}"?`,
    header: 'Duplicar grupo',
    icon: 'pi pi-copy',
    acceptClass: 'p-button-info',
    accept: async () => {
      try {
        // TODO: Implementar duplicación de grupo
        toast.add({
          severity: 'info',
          summary: 'Función pendiente',
          detail: 'La duplicación de grupos estará disponible pronto',
        })
      } catch (error) {
        console.error('Error duplicating group:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo duplicar el grupo',
        })
      }
    },
  })
}

const exportGroups = () => {
  try {
    const groupsToExport = filteredGroups.value.map((group) => ({
      nombre: group.name,
      descripcion: group.description || 'Sin descripción',
      estado: getStatusLabel(group.status),
      estudiantes: group.users?.length || 0,
      examenes: group.exams?.length || 0,
      creado: formatDateForCSV(group.created_at),
    }))

    const csvContent = [
      'Nombre,Descripción,Estado,Estudiantes,Exámenes,Creado',
      ...groupsToExport.map(
        (group) =>
          `"${group.nombre}","${group.descripcion}","${group.estado}",${group.estudiantes},${group.examenes},"${group.creado}"`,
      ),
    ].join('\n')

    // Agregar BOM para UTF-8 para compatibilidad con Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `grupos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.add({
      severity: 'success',
      summary: 'Exportación exitosa',
      detail: `${groupsToExport.length} grupos exportados correctamente`,
    })
  } catch (error) {
    console.error('Error exporting groups:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar los grupos',
    })
  }
}

const importGroups = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string
          // TODO: Implementar importación de grupos
          toast.add({
            severity: 'info',
            summary: 'Función pendiente',
            detail: 'La importación de grupos estará disponible pronto',
          })
        } catch (error) {
          console.error('Error importing groups:', error)
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo importar el archivo',
          })
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const generateReport = async (type: 'pdf' | 'excel' = 'pdf') => {
  try {
    // Mostrar indicador de carga
    const loadingToast = toast.add({
      severity: 'info',
      summary: 'Generando reporte',
      detail: 'Por favor espere mientras se genera el reporte...',
      life: 0, // No se cierra automáticamente
    }) as any

    // Preparar filtros para el reporte
    const reportFilters = {
      status: filters.value.status || null,
      teacher: filters.value.teacher || null,
      date_range: filters.value.dateRange
        ? {
            start: filters.value.dateRange[0],
            end: filters.value.dateRange[1],
          }
        : null,
      search: filters.value.search || null,
    }

    // Llamar al backend para generar el reporte usando axios directamente
    const token = localStorage.getItem('auth_token')

    const response = await axios.post(
      'http://localhost:8001/api/v1/reports/groups',
      {
        type: type,
        filters: reportFilters,
        include_charts: type === 'pdf',
      },
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Obtener el archivo del response
    const blob = response.data

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const extension = type === 'pdf' ? 'pdf' : 'xlsx'
    link.download = `reporte_grupos_${new Date().toISOString().split('T')[0]}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Cerrar toast de carga y mostrar éxito
    if (loadingToast) {
      toast.remove(loadingToast)
    }
    toast.add({
      severity: 'success',
      summary: 'Reporte generado',
      detail: 'El reporte se ha descargado correctamente',
    })
  } catch (error) {
    console.error('Error generating report:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo generar el reporte. Verifique su conexión e intente nuevamente.',
    })
  }
}

const assignTeacher = (group: Group) => {
  // TODO: Implementar asignación de profesor
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'La asignación de profesores estará disponible pronto',
  })
}

const transferGroup = (group: Group) => {
  // TODO: Implementar transferencia de grupo
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'La transferencia de grupos estará disponible pronto',
  })
}

// Acciones masivas
const bulkActivate = () => {
  if (selectedGroups.value.length === 0) return

  confirm.require({
    message: `¿Estás seguro de que quieres activar ${selectedGroups.value.length} grupo(s) seleccionado(s)?`,
    header: 'Activar grupos',
    icon: 'pi pi-check-circle',
    acceptClass: 'p-button-success',
    accept: async () => {
      await processBulkAction('activate')
    },
  })
}

const bulkDeactivate = () => {
  if (selectedGroups.value.length === 0) return

  confirm.require({
    message: `¿Estás seguro de que quieres desactivar ${selectedGroups.value.length} grupo(s) seleccionado(s)?`,
    header: 'Desactivar grupos',
    icon: 'pi pi-pause-circle',
    acceptClass: 'p-button-warning',
    accept: async () => {
      await processBulkAction('deactivate')
    },
  })
}

const bulkArchive = () => {
  if (selectedGroups.value.length === 0) return

  confirm.require({
    message: `¿Estás seguro de que quieres archivar ${selectedGroups.value.length} grupo(s) seleccionado(s)?`,
    header: 'Archivar grupos',
    icon: 'pi pi-archive',
    acceptClass: 'p-button-info',
    accept: async () => {
      await processBulkAction('archive')
    },
  })
}

const bulkDelete = () => {
  if (selectedGroups.value.length === 0) return

  confirm.require({
    message: `¿Estás seguro de que quieres eliminar ${selectedGroups.value.length} grupo(s) seleccionado(s)? Esta acción no se puede deshacer.`,
    header: 'Eliminar grupos',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await processBulkAction('delete')
    },
  })
}

const processBulkAction = async (action: string) => {
  if (selectedGroups.value.length === 0) return

  try {
    isProcessingBulkAction.value = true
    const groupIds = selectedGroups.value.map((group) => group.id)
    let successCount = 0
    let errorCount = 0

    for (const groupId of groupIds) {
      try {
        switch (action) {
          case 'activate':
            await groupStore.updateGroup(groupId, { id: groupId, status: 'active' })
            break
          case 'deactivate':
            await groupStore.updateGroup(groupId, { id: groupId, status: 'inactive' })
            break
          case 'archive':
            // Por ahora usamos 'inactive' ya que 'archived' no está en el tipo
            await groupStore.updateGroup(groupId, { id: groupId, status: 'inactive' })
            break
          case 'delete':
            await groupStore.deleteGroup(groupId)
            break
        }
        successCount++
      } catch (error) {
        console.error(`Error processing group ${groupId}:`, error)
        errorCount++
      }
    }

    // Mostrar resultado
    if (successCount > 0) {
      toast.add({
        severity: 'success',
        summary: 'Acción completada',
        detail: `${successCount} grupo(s) procesado(s) correctamente`,
      })
    }

    if (errorCount > 0) {
      toast.add({
        severity: 'warn',
        summary: 'Algunos errores',
        detail: `${errorCount} grupo(s) no pudieron ser procesado(s)`,
      })
    }

    // Limpiar selección
    selectedGroups.value = []
  } catch (error) {
    console.error('Error in bulk action:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al procesar la acción masiva',
    })
  } finally {
    isProcessingBulkAction.value = false
  }
}

// Función para obtener el total de grupos filtrados
const getFilteredCount = () => {
  return filteredGroups.value.length
}

// Función para obtener el total de grupos
const getTotalCount = () => {
  return groupStore.groups.length
}

// Lifecycle
onMounted(async () => {
  await loadGroups()
  // Cargar información de uso del plan
  try {
    await subscriptionStore.fetchUsage()
  } catch (error) {
    console.error('Error loading subscription usage:', error)
  }
})
</script>

<template>
  <div class="grid">
    <!-- Header -->
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2 mr-2">
              {{ isAdminView ? 'Gestionar Grupos' : 'Mis Grupos' }}
            </h1>
          </div>
          <Button icon="pi pi-plus" @click="goToCreateGroup" severity="success" rounded />
        </div>
        <div>
          <p class="text-600">
            {{
              isAdminView
                ? 'Administra todos los grupos del sistema y sus configuraciones'
                : 'Gestiona todos tus grupos de estudiantes'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Estadísticas Globales (Solo para Admin) -->
    <div v-if="isAdminView && groupStats" class="col-12 mb-4">
      <div class="card">
        <div class="flex flex-wrap gap-4 justify-content-center">
          <!-- Tarjeta 1: Total de Grupos -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-blue-100 text-blue-600 border-round">
                <i class="pi pi-users text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ groupStats.totalGroups }}</div>
                <div class="text-600 font-medium text-sm">Total de Grupos</div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 2: Grupos Activos -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-green-100 text-green-600 border-round">
                <i class="pi pi-check-circle text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ groupStats.activeGroups }}</div>
                <div class="text-600 font-medium text-sm">Grupos Activos</div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 3: Total Estudiantes -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-purple-100 text-purple-600 border-round">
                <i class="pi pi-user text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ groupStats.totalStudents }}</div>
                <div class="text-600 font-medium text-sm">Total Estudiantes</div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 4: Total Exámenes -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-orange-100 text-orange-600 border-round">
                <i class="pi pi-file text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ groupStats.totalExams }}</div>
                <div class="text-600 font-medium text-sm">Total Exámenes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones de Gestión (Solo para Admin) -->
    <div v-if="isAdminView" class="col-12 mb-4">
      <div class="card">
        <div class="flex align-items-center gap-2 mb-4">
          <i class="pi pi-cog text-primary text-xl"></i>
          <h5 class="text-900 font-semibold m-0">Acciones de Gestión</h5>
        </div>

        <div class="flex flex-wrap gap-3">
          <!-- Exportar Grupos -->
          <Button
            label="Exportar CSV"
            icon="pi pi-download"
            class="p-button-outlined p-button-success"
            @click="exportGroups"
            v-tooltip.top="'Exportar lista de grupos a CSV'"
          />

          <!-- Importar Grupos -->
          <Button
            label="Importar CSV"
            icon="pi pi-upload"
            class="p-button-outlined p-button-info"
            @click="importGroups"
            v-tooltip.top="'Importar grupos desde archivo CSV'"
          />

          <!-- Generar Reporte PDF -->
          <Button
            label="Reporte PDF"
            icon="pi pi-file-pdf"
            class="p-button-outlined p-button-warning"
            @click="() => generateReport('pdf')"
            v-tooltip.top="'Generar reporte detallado en PDF'"
          />

          <!-- Generar Reporte Excel -->
          <Button
            label="Reporte Excel"
            icon="pi pi-file-excel"
            class="p-button-outlined p-button-success"
            @click="() => generateReport('excel')"
            v-tooltip.top="'Generar reporte en Excel'"
          />

          <!-- Separador visual -->
          <div class="flex align-items-center">
            <Divider layout="vertical" />
          </div>

          <!-- Acciones Masivas -->
          <Button
            label="Asignar Profesor"
            icon="pi pi-user-plus"
            class="p-button-outlined p-button-secondary"
            :disabled="selectedGroups.length === 0"
            @click="() => selectedGroups.forEach((group) => assignTeacher(group))"
            v-tooltip.top="'Asignar profesor a grupos seleccionados'"
          />

          <Button
            label="Transferir Grupos"
            icon="pi pi-share-alt"
            class="p-button-outlined p-button-secondary"
            :disabled="selectedGroups.length === 0"
            @click="() => selectedGroups.forEach((group) => transferGroup(group))"
            v-tooltip.top="'Transferir grupos seleccionados'"
          />
        </div>

        <!-- Información de selección -->
        <div v-if="selectedGroups.length > 0" class="mt-3 p-3 bg-blue-50 border-round">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-info-circle text-blue-600"></i>
            <span class="text-blue-800 font-medium">
              {{ selectedGroups.length }} grupo(s) seleccionado(s) para acciones masivas
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas Detalladas -->
    <div v-if="isAdminView && groupStats" class="col-12 mb-4">
      <div class="grid">
        <!-- Tarjeta de Resumen de Estadísticas -->
        <div class="col-12 mb-4">
          <div class="card p-4 surface-card shadow-2 border-round-xl">
            <div class="grid grid-cols-12 gap-6 mb-8">
              <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 p-3 border-right-1 surface-border"
              >
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary mb-2">
                    {{ groupStats.totalGroups }}
                  </div>
                  <div class="text-600 font-medium">Grupos Totales</div>
                  <div class="text-sm text-500 mt-2">
                    <i class="pi pi-arrow-up text-green-500 mr-1"></i>
                    <span class="text-green-500">+{{ groupStats.recentGroups }} recientes</span>
                  </div>
                </div>
              </div>
              <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 p-3 border-right-1 surface-border"
              >
                <div class="text-center">
                  <div class="text-4xl font-bold text-green-600 mb-2">
                    {{ groupStats.activeGroups }}
                  </div>
                  <div class="text-600 font-medium">Activos</div>
                  <div class="text-sm text-500">
                    {{
                      groupStats.totalGroups > 0
                        ? Math.round((groupStats.activeGroups / groupStats.totalGroups) * 100)
                        : 0
                    }}% del total
                  </div>
                </div>
              </div>
              <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 p-3 border-right-1 surface-border"
              >
                <div class="text-center">
                  <div class="text-4xl font-bold text-blue-600 mb-2">
                    {{ groupStats.totalStudents }}
                  </div>
                  <div class="text-600 font-medium">Estudiantes</div>
                  <div class="text-sm text-500">
                    Promedio: {{ groupStats.avgStudentsPerGroup }} por grupo
                  </div>
                </div>
              </div>
              <div class="col-span-12 lg:col-span-6 xl:col-span-3 p-3">
                <div class="text-center">
                  <div class="text-4xl font-bold text-orange-600 mb-2">
                    {{ groupStats.totalExams }}
                  </div>
                  <div class="text-600 font-medium">Exámenes</div>
                  <div class="text-sm text-500">
                    Promedio: {{ groupStats.avgExamsPerGroup }} por grupo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribución por Estado -->
        <div class="col-12 lg:col-6 mb-4">
          <div class="card h-full surface-card shadow-2 border-round-xl overflow-hidden">
            <div class="p-4 border-bottom-1 surface-border flex align-items-center gap-3">
              <div
                class="flex align-items-center justify-content-center bg-blue-100 text-blue-600 p-2 border-round"
                style="width: 36px; height: 36px"
              >
                <i class="pi pi-chart-pie text-lg"></i>
              </div>
              <h5 class="text-900 font-semibold m-0">Distribución por Estado</h5>
            </div>
            <div class="grid grid-cols-12 gap-6 mb-8">
              <div
                class="col-span-12 lg:col-span-6 xl:col-span-4 p-3 border-right-1 surface-border"
                v-for="(item, index) in [
                  {
                    label: 'Activos',
                    value: groupStats.activeGroups,
                    color: 'green-500',
                    icon: 'pi pi-check-circle',
                  },
                  {
                    label: 'Inactivos',
                    value: groupStats.inactiveGroups,
                    color: 'yellow-500',
                    icon: 'pi pi-pause-circle',
                  },
                  {
                    label: 'Pendientes',
                    value: groupStats.pendingGroups,
                    color: 'gray-500',
                    icon: 'pi pi-clock',
                  },
                ]"
                :key="index"
              >
                <div class="flex justify-content-between align-items-center mb-2">
                  <div class="flex align-items-center gap-3">
                    <i :class="`${item.icon} text-${item.color} text-lg`"></i>
                    <span class="text-900 font-medium">{{ item.label }}</span>
                  </div>
                  <span class="font-semibold">{{ item.value }}</span>
                </div>
                <div class="h-2rem w-full bg-gray-100 border-round overflow-hidden">
                  <div
                    :style="{
                      width:
                        groupStats.totalGroups > 0
                          ? `${(item.value / groupStats.totalGroups) * 100}%`
                          : '0%',
                      'background-color': `var(--${item.color})`,
                    }"
                    class="h-full transition-all transition-duration-1000 transition-ease-in-out"
                  ></div>
                </div>
                <div class="flex justify-content-between mt-1">
                  <span class="text-xs text-500"
                    >{{
                      groupStats.totalGroups > 0
                        ? Math.round((item.value / groupStats.totalGroups) * 100)
                        : 0
                    }}% del total</span
                  >
                  <span class="text-xs font-semibold"
                    >{{ item.value }} de {{ groupStats.totalGroups }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas Promedio -->
        <div class="col-12 lg:col-6 mb-4">
          <div class="card h-full surface-card shadow-2 border-round-xl overflow-hidden">
            <div class="p-4 border-bottom-1 surface-border flex align-items-center gap-3">
              <div
                class="flex align-items-center justify-content-center bg-orange-100 text-orange-600 p-2 border-round"
                style="width: 36px; height: 36px"
              >
                <i class="pi pi-chart-bar text-lg"></i>
              </div>
              <h5 class="text-900 font-semibold m-0">Métricas Clave</h5>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-12 gap-6 mb-8">
                <div
                  v-for="(metric, index) in [
                    {
                      label: 'Estudiantes por Grupo',
                      value: groupStats.avgStudentsPerGroup,
                      icon: 'pi pi-users',
                      color: 'blue-500',
                      trend: 5.2,
                      trendType: 'up',
                    },
                    {
                      label: 'Exámenes por Grupo',
                      value: groupStats.avgExamsPerGroup,
                      icon: 'pi pi-file',
                      color: 'purple-500',
                      trend: 2.1,
                      trendType: 'up',
                    },
                    {
                      label: 'Grupos Recientes (7 días)',
                      value: groupStats.recentGroups,
                      icon: 'pi pi-calendar',
                      color: 'green-500',
                      trend: 12.5,
                      trendType: 'up',
                    },
                  ]"
                  :key="'metric-' + index"
                  class="col-span-12 lg:col-span-6 xl:col-span-4 p-3 border-right-1 surface-border"
                >
                  <div class="flex justify-content-between align-items-center">
                    <div class="flex align-items-center gap-3">
                      <div
                        :class="`flex align-items-center justify-content-center bg-${metric.color} bg-opacity-10 p-2 border-round`"
                        style="width: 40px; height: 40px"
                      >
                        <i :class="`${metric.icon} text-${metric.color} text-lg`"></i>
                      </div>
                      <div>
                        <div class="text-900 font-medium">{{ metric.label }}</div>
                        <div class="text-sm text-500">Promedio por grupo</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-bold text-900">{{ metric.value }}</div>
                      <div
                        :class="`text-xs font-semibold flex align-items-center justify-content-end ${metric.trendType === 'up' ? 'text-green-500' : 'text-red-500'}`"
                      >
                        <i :class="`pi pi-arrow-${metric.trendType} mr-1 text-xs`"></i>
                        {{ metric.trend }}% {{ metric.trendType === 'up' ? 'más' : 'menos' }} que el
                        mes pasado
                      </div>
                    </div>
                  </div>
                  <div v-if="index < 2" class="mt-3 border-top-1 surface-border pt-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grupos Más Activos -->
        <div v-if="groupStats.mostActiveGroups.length > 0" class="col-12 mb-4">
          <div class="card">
            <div class="flex align-items-center gap-2 mb-4">
              <i class="pi pi-trophy text-primary text-xl"></i>
              <h5 class="text-900 font-semibold m-0">Grupos Más Activos</h5>
            </div>
            <div class="grid grid-cols-12 gap-6 mb-8">
              <div
                v-for="(group, index) in groupStats.mostActiveGroups"
                :key="group.id"
                class="col-span-12 lg:col-span-6 xl:col-span-4 p-3 border-right-1 surface-border"
              >
                <div class="group-card border-1 surface-border border-round p-4 h-full">
                  <div class="flex justify-content-between align-items-start mb-3">
                    <h6 class="text-900 font-semibold m-0 text-lg">{{ group.name }}</h6>
                    <Tag :value="`#${index + 1}`" severity="info" class="text-xs" />
                  </div>
                  <p class="text-600 text-sm mb-4 line-height-3">
                    {{ group.description || 'Sin descripción' }}
                  </p>
                  <div class="flex justify-content-between align-items-center">
                    <div class="flex align-items-center gap-2">
                      <div class="group-stat bg-blue-100 text-blue-600 border-round p-2">
                        <i class="pi pi-users text-sm"></i>
                      </div>
                      <div class="flex flex-column">
                        <span class="text-900 font-semibold">{{ group.users?.length || 0 }}</span>
                        <span class="text-600 text-xs">estudiantes</span>
                      </div>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <div class="group-stat bg-orange-100 text-orange-600 border-round p-2">
                        <i class="pi pi-file text-sm"></i>
                      </div>
                      <div class="flex flex-column">
                        <span class="text-900 font-semibold">{{ group.exams?.length || 0 }}</span>
                        <span class="text-600 text-xs">exámenes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-3">
          <h5 class="text-900 font-semibold mb-0">
            {{ isAdminView ? 'Filtros Avanzados' : 'Filtros' }}
          </h5>
          <Button
            v-if="isAdminView"
            :label="showAdvancedFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'"
            :icon="showAdvancedFilters ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            class="p-button-text p-button-sm"
            @click="showAdvancedFilters = !showAdvancedFilters"
          />
        </div>

        <!-- Filtros Básicos -->
        <div class="flex justify-content-end align-items-center gap-3 mt-4">
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              type="text"
              :placeholder="isAdminView ? 'Buscar en todos los grupos...' : 'Buscar grupos...'"
              v-model="filters.search"
            />
          </IconField>

          <Button
            v-if="hasActiveFilters"
            label="Limpiar"
            icon="pi pi-filter-slash"
            class="p-button-outlined p-button-success"
            @click="clearFilters"
          />
          <div v-if="hasActiveFilters" class="flex align-items-center" style="gap: 1rem">
            <span class="text-600 text-sm font-medium">
              Mostrando {{ getFilteredCount() }} de {{ getTotalCount() }} grupos
            </span>
            <Tag
              v-if="getFilteredCount() !== getTotalCount()"
              :value="`${getTotalCount() - getFilteredCount()} ocultos`"
              severity="info"
              class="text-xs"
            />
          </div>
        </div>

        <!-- Filtros Avanzados (Solo para Admin) -->
        <div
          v-if="isAdminView && showAdvancedFilters"
          class="mt-4 pt-4 border-top-1 surface-border"
        >
          <div class="grid">
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Estado</label>
              <Select
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Todos los estados"
                class="w-full"
              />
            </div>
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Profesor</label>
              <Select
                v-model="filters.teacher"
                :options="teacherOptions"
                placeholder="Todos los profesores"
                class="w-full"
              />
            </div>
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Rango de Fechas</label>
              <DatePicker
                v-model="filters.dateRange"
                selectionMode="range"
                :manualInput="false"
                placeholder="Seleccionar rango"
                class="w-full"
              />
            </div>
            <div class="col-12 md:col-3 flex align-items-end">
              <Button
                label="Aplicar Filtros"
                icon="pi pi-filter"
                class="p-button-outlined w-full"
                @click="applyAdvancedFilters"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de Acciones Masivas -->
    <div class="col-12" v-if="showBulkActions">
      <div class="card">
        <div class="flex justify-content-between align-items-center">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-check-circle text-primary"></i>
            <span class="font-semibold text-900">
              {{ selectedGroups.length }} grupo(s) seleccionado(s)
            </span>
          </div>

          <div class="flex gap-2">
            <Button
              label="Activar"
              icon="pi pi-check"
              class="p-button-success p-button-sm"
              @click="bulkActivate"
              :loading="isProcessingBulkAction"
            />
            <Button
              label="Desactivar"
              icon="pi pi-pause"
              class="p-button-warning p-button-sm"
              @click="bulkDeactivate"
              :loading="isProcessingBulkAction"
            />
            <Button
              label="Archivar"
              icon="pi pi-archive"
              class="p-button-info p-button-sm"
              @click="bulkArchive"
              :loading="isProcessingBulkAction"
            />
            <Button
              label="Eliminar"
              icon="pi pi-trash"
              class="p-button-danger p-button-sm"
              @click="bulkDelete"
              :loading="isProcessingBulkAction"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Grupos -->
    <div class="col-12">
      <div class="card">
        <DataTable
          :value="filteredGroups"
          :loading="groupStore.isLoading"
          :selection="selectedGroups"
          selectionMode="multiple"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} grupos"
          :emptyMessage="groupStore.error ? 'Error al cargar grupos' : 'No se encontraron grupos'"
          class="p-datatable-sm"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

          <!-- Nombre -->
          <Column field="name" header="Nombre" sortable>
            <template #body="slotProps">
              <div class="font-medium text-900">{{ slotProps.data.name }}</div>
              <div class="text-600 text-sm">
                {{ slotProps.data.description || 'Sin descripción' }}
              </div>
            </template>
          </Column>

          <!-- Estado -->
          <Column field="status" header="Estado" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusLabel(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Estudiantes -->
          <Column field="students_count" header="Estudiantes" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ slotProps.data.students?.length || 0 }}</div>
                <div class="text-600 text-xs">estudiantes</div>
              </div>
            </template>
          </Column>

          <!-- Exámenes Asignados -->
          <Column field="exams_count" header="Exámenes" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ slotProps.data.exams?.length || 0 }}</div>
                <div class="text-600 text-xs">asignados</div>
              </div>
            </template>
          </Column>

          <!-- Fecha de Creación -->
          <Column field="created_at" header="Creado" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ formatDate(slotProps.data.created_at) }}</div>
              </div>
            </template>
          </Column>

          <!-- Acciones -->
          <Column header="Acciones" :style="isAdminView ? 'min-width: 16rem' : 'min-width: 12rem'">
            <template #body="slotProps">
              <div class="flex gap-1 justify-content-center flex-wrap">
                <!-- Acciones básicas -->
                <Button
                  icon="pi pi-eye"
                  class="p-button-text p-button-sm"
                  @click="viewGroup(slotProps.data)"
                  v-tooltip.top="'Ver detalles'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  @click="editGroup(slotProps.data)"
                  v-tooltip.top="'Editar'"
                />

                <!-- Acciones de gestión (solo para admin) -->
                <template v-if="isAdminView">
                  <Button
                    icon="pi pi-copy"
                    class="p-button-text p-button-sm p-button-info"
                    @click="duplicateGroup(slotProps.data)"
                    v-tooltip.top="'Duplicar grupo'"
                  />
                  <Button
                    icon="pi pi-user-plus"
                    class="p-button-text p-button-sm p-button-secondary"
                    @click="assignTeacher(slotProps.data)"
                    v-tooltip.top="'Asignar profesor'"
                  />
                  <Button
                    icon="pi pi-share-alt"
                    class="p-button-text p-button-sm p-button-secondary"
                    @click="transferGroup(slotProps.data)"
                    v-tooltip.top="'Transferir grupo'"
                  />
                </template>

                <!-- Acción de eliminar -->
                <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  @click="deleteGroup(slotProps.data)"
                  v-tooltip.top="'Eliminar'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog />

    <!-- Modal de límite de plan -->
    <PlanLimitModal
      v-model="showPlanLimitModal"
      title="Límite de Grupos Alcanzado"
      message="Has alcanzado el límite de grupos de tu plan actual"
      description="Tu plan actual solo permite crear un número limitado de grupos. Actualiza tu plan para crear más grupos."
      resource-type="grupos"
      :limit-info="
        subscriptionStore.usage && subscriptionStore.currentPlan
          ? {
              current: subscriptionStore.usage.current_usage?.groups || 0,
              limit: subscriptionStore.currentPlan.max_groups || 0,
            }
          : undefined
      "
    />
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

/* Estilos para la tabla */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-header) {
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-50);
}

/* Estilos para los filtros */
:deep(.p-inputtext) {
  border-radius: 6px;
}

:deep(.p-dropdown) {
  border-radius: 6px;
}

:deep(.p-calendar) {
  border-radius: 6px;
}

/* Estilos para los tags */
:deep(.p-tag) {
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Estilos para la paginación */
:deep(.p-paginator) {
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  border-radius: 0 0 8px 8px;
}

:deep(.p-paginator .p-paginator-page) {
  border-radius: 6px;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

/* Estilos para las tarjetas de estadísticas */
.stats-card {
  transition: all 0.3s ease;
  border: 1px solid var(--surface-border);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Estilos para las tarjetas horizontales */
.stats-card-horizontal {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.stats-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Indicadores de estado */
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Iconos de métricas */
.metric-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tarjetas de grupos */
.group-card {
  transition: all 0.3s ease;
  background: var(--surface-card);
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.group-stat {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mejoras de espaciado */
.mb-4 {
  margin-bottom: 1.5rem !important;
}

/* Altura uniforme para las tarjetas */
.h-full {
  height: 100%;
}

/* Mejoras en la tipografía */
.line-height-3 {
  line-height: 1.5;
}

/* Colores personalizados */
.bg-blue-100 {
  background-color: #dbeafe;
}

.text-blue-600 {
  color: #2563eb;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-600 {
  color: #16a34a;
}

.bg-purple-100 {
  background-color: #f3e8ff;
}

.text-purple-600 {
  color: #9333ea;
}

.bg-orange-100 {
  background-color: #fed7aa;
}

.text-orange-600 {
  color: #ea580c;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.text-yellow-600 {
  color: #d97706;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.text-gray-600 {
  color: #6b7280;
}

/* Estilos para acciones de gestión */
.bg-blue-50 {
  background-color: #eff6ff;
}

.text-blue-800 {
  color: #1e40af;
}

/* Mejoras para botones de acción */
.flex-wrap {
  flex-wrap: wrap;
}

/* Estilos para tooltips */
:deep(.p-tooltip) {
  font-size: 0.75rem;
}

/* Mejoras para la tabla de acciones */
:deep(.p-datatable-tbody > tr > td:last-child) {
  padding: 0.5rem;
}

/* Estilos para botones de acción individual */
:deep(.p-button.p-button-text.p-button-sm) {
  padding: 0.5rem;
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-button.p-button-text.p-button-sm .p-button-icon) {
  font-size: 0.875rem;
}
</style>
