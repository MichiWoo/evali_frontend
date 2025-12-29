<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-96">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="card">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else-if="!student" class="card">
    <Message severity="warn" :closable="false">Estudiante no encontrado</Message>
  </div>

  <div v-else class="grid">
    <!-- Header Section -->
    <div class="col-12 mb-4">
      <div class="card mb-0">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-3">
              <Button
                icon="pi pi-arrow-left"
                text
                @click="goBack"
                class="p-button-sm"
                v-tooltip.top="'Volver a la lista'"
              />
              <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
                {{ student.name }}
              </h1>
            </div>
            <p class="text-muted-color text-lg mb-4 max-w-2xl">{{ student.email }}</p>

            <!-- Status Badge -->
            <div class="flex items-center gap-3 mb-4">
              <Tag
                :value="getStatusLabel(student.status)"
                :severity="getStatusSeverity(student.status)"
                icon="pi pi-circle-fill"
              />
              <span class="text-muted-color">
                <i class="pi pi-calendar mr-2"></i>
                Registrado {{ formatDate(student.created_at) }}
              </span>
              <span v-if="student.last_login" class="text-muted-color">
                <i class="pi pi-clock mr-2"></i>
                Último acceso {{ formatDate(student.last_login) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-row justify-center items-center gap-2">
            <Button
              icon="pi pi-pencil"
              label="Editar"
              @click="editStudent"
              class="p-button-primary"
            />
            <Button
              icon="pi pi-user-plus"
              label="Agregar a Grupo"
              @click="addToGroup"
              class="p-button-help"
              outlined
            />
            <Button
              icon="pi pi-trash"
              label="Eliminar"
              @click="confirmDelete"
              class="p-button-danger"
              outlined
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="col-12">
      <div class="grid grid-cols-12 gap-6 mb-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Grupos</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ student.user_groups?.length || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-users text-blue-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ student.user_groups?.length || 0 }} </span>
            <span class="text-muted-color"> grupos inscritos</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Exámenes</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ studentStats?.totalExams || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-file text-orange-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ studentStats?.totalExams || 0 }} </span>
            <span class="text-muted-color"> exámenes asignados</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Completados</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ studentStats?.completedExams || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-check-circle text-cyan-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ studentStats?.completedExams || 0 }} </span>
            <span class="text-muted-color"> exámenes completados</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Promedio</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ studentStats?.averageScore || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-star text-purple-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ studentStats?.averageScore || 0 }} </span>
            <span class="text-muted-color"> puntos promedio</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Information -->
    <div class="col-12 lg:col-6">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Información del Estudiante</div>

        <div class="flex flex-col gap-4">
          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Estado</span>
            <Tag
              :value="getStatusLabel(student.status)"
              :severity="getStatusSeverity(student.status)"
            />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Email</span>
            <span class="text-sm">{{ student.email }}</span>
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Grupos inscritos</span>
            <Tag :value="student.user_groups?.length || 0" severity="primary" />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Fecha de registro</span>
            <Tag :value="formatDate(student.created_at)" severity="secondary" />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Último acceso</span>
            <Tag
              :value="student.last_login ? formatDate(student.last_login) : 'Nunca'"
              :severity="student.last_login ? 'info' : 'secondary'"
            />
          </div>

          <div class="flex items-center justify-between py-2">
            <span class="font-medium text-muted-color">ID del estudiante</span>
            <Tag :value="student.id" severity="secondary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="col-12 lg:col-6">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Acciones Rápidas</div>

        <div class="flex gap-3">
          <Button
            icon="pi pi-user-plus"
            label="Agregar a Grupo"
            @click="addToGroup"
            class="p-button-outlined w-full justify-start"
          />
          <Button
            icon="pi pi-file-plus"
            label="Asignar Exámenes"
            @click="assignExams"
            class="p-button-outlined w-full justify-start"
          />
          <Button
            icon="pi pi-chart-bar"
            label="Ver Estadísticas"
            @click="viewStatistics"
            class="p-button-outlined w-full justify-start"
          />
          <Button
            icon="pi pi-envelope"
            label="Enviar Mensaje"
            @click="sendMessage"
            class="p-button-outlined w-full justify-start"
          />
        </div>
      </div>
    </div>

    <!-- Groups List -->
    <div class="col-12" v-if="student.user_groups && student.user_groups.length > 0">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Grupos del Estudiante</div>
          <Button
            icon="pi pi-user-plus"
            label="Agregar a Grupo"
            @click="addToGroup"
            class="p-button-sm"
          />
        </div>

        <DataTable
          :value="student.user_groups"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          :loading="isLoading"
          stripedRows
        >
          <Column field="id" header="ID" style="width: 10%">
            <template #body="slotProps">
              <Tag :value="slotProps.data.id" severity="secondary" />
            </template>
          </Column>

          <Column field="name" header="Nombre" style="width: 40%">
            <template #body="slotProps">
              <div class="font-medium">{{ slotProps.data.name }}</div>
              <div class="text-muted-color text-sm">
                {{ slotProps.data.description || 'Sin descripción' }}
              </div>
            </template>
          </Column>

          <Column field="status" header="Estado" style="width: 15%">
            <template #body="slotProps">
              <Tag
                :value="getGroupStatusLabel(slotProps.data.status)"
                :severity="getGroupStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>

          <Column field="created_at" header="Fecha de Ingreso" style="width: 20%">
            <template #body="slotProps">
              <span class="text-sm">{{
                formatDate(slotProps.data.pivot?.created_at || slotProps.data.created_at)
              }}</span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 15%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  @click="viewGroup(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Ver grupo'"
                />
                <Button
                  icon="pi pi-times"
                  @click="removeFromGroup(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm p-button-danger"
                  v-tooltip.top="'Remover del grupo'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Empty State for Groups -->
    <div class="col-12" v-else>
      <div class="card text-center py-8">
        <i class="pi pi-users text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          El estudiante no está inscrito en ningún grupo
        </h3>
        <p class="text-muted-color mb-4">
          Agrega al estudiante a un grupo para comenzar a gestionar sus exámenes
        </p>
        <Button
          icon="pi pi-user-plus"
          label="Agregar a Grupo"
          @click="addToGroup"
          class="p-button-primary"
        />
      </div>
    </div>

    <!-- Exam History -->
    <div class="col-12" v-if="studentAttempts && studentAttempts.length > 0">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Historial de Exámenes</div>
          <Button
            icon="pi pi-refresh"
            label="Actualizar"
            @click="loadStudentData"
            class="p-button-sm"
          />
        </div>

        <DataTable
          :value="studentAttempts"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          :loading="isLoading"
          stripedRows
        >
          <Column field="id" header="ID" style="width: 8%">
            <template #body="slotProps">
              <Tag :value="slotProps.data.id" severity="secondary" />
            </template>
          </Column>

          <Column field="exam.title" header="Examen" style="width: 30%">
            <template #body="slotProps">
              <div class="font-medium">{{ slotProps.data.exam?.title || 'Examen eliminado' }}</div>
              <div class="text-muted-color text-sm">Intento #{{ slotProps.data.attempt }}</div>
            </template>
          </Column>

          <Column field="status" header="Estado" style="width: 12%">
            <template #body="slotProps">
              <Tag
                :value="getAttemptStatusLabel(slotProps.data.status)"
                :severity="getAttemptStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>

          <Column field="score" header="Puntuación" style="width: 15%">
            <template #body="slotProps">
              <div v-if="slotProps.data.score !== null" class="font-semibold">
                {{ slotProps.data.score }}/{{ slotProps.data.total_points }}
                <span class="text-muted-color text-sm">({{ slotProps.data.percentage }}%)</span>
              </div>
              <span v-else class="text-muted-color">-</span>
            </template>
          </Column>

          <Column field="started_at" header="Iniciado" style="width: 15%">
            <template #body="slotProps">
              <span class="text-sm">{{ formatDate(slotProps.data.started_at) }}</span>
            </template>
          </Column>

          <Column field="completed_at" header="Completado" style="width: 15%">
            <template #body="slotProps">
              <span class="text-sm">{{
                slotProps.data.completed_at ? formatDate(slotProps.data.completed_at) : '-'
              }}</span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 5%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  @click="viewAttempt(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Ver detalles'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Empty State for Exam History -->
    <div class="col-12" v-else>
      <div class="card text-center py-8">
        <i class="pi pi-file text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          No hay historial de exámenes
        </h3>
        <p class="text-muted-color mb-4">El estudiante aún no ha realizado ningún examen</p>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/students'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import type { Student } from '@/types'

// Components
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import ConfirmDialog from 'primevue/confirmdialog'

// Composables
const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const confirm = useConfirm()
const toast = useToast()

// State
const studentId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const student = computed(() => studentStore.currentStudent)
const studentStats = computed(() => studentStore.getStudentStats)
const studentAttempts = computed(() => studentStore.studentAttempts)

// Methods
const loadStudentData = async () => {
  try {
    isLoading.value = true
    error.value = null
    await Promise.all([
      studentStore.fetchStudent(studentId.value),
      studentStore.fetchStudentExams(studentId.value),
      studentStore.fetchStudentAttempts(studentId.value),
    ])
  } catch (err: any) {
    error.value = err.message || 'Error al cargar datos del estudiante'
    console.error('Error loading student data:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/students')
}

const editStudent = () => {
  router.push(`/students/${studentId.value}/edit`)
}

const addToGroup = () => {
  // TODO: Implementar agregar a grupo
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'Agregar a grupo estará disponible pronto',
  })
}

const assignExams = () => {
  // TODO: Implementar asignar exámenes
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'Asignar exámenes estará disponible pronto',
  })
}

const viewStatistics = () => {
  // TODO: Implementar estadísticas
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'Las estadísticas estarán disponibles pronto',
  })
}

const sendMessage = () => {
  // TODO: Implementar envío de mensajes
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'Enviar mensajes estará disponible pronto',
  })
}

const confirmDelete = () => {
  confirm.require({
    message:
      '¿Estás seguro de que quieres eliminar este estudiante? Esta acción no se puede deshacer.',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await studentStore.deleteStudent(studentId.value)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Estudiante eliminado correctamente',
        })
        router.push('/students')
      } catch (err: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error al eliminar el estudiante',
        })
      }
    },
  })
}

const viewGroup = (groupId: number) => {
  router.push(`/groups/${groupId}`)
}

const removeFromGroup = async (groupId: number) => {
  try {
    await studentStore.removeStudentFromGroup(studentId.value, groupId)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estudiante removido del grupo',
    })
    await loadStudentData() // Recargar datos
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al remover del grupo',
    })
  }
}

const viewAttempt = (attemptId: number) => {
  router.push(`/student/results/${attemptId}`)
}

// Utility functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusLabel = (status: string) => {
  const statuses: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
  }
  return statuses[status] || status
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
  }
  return severities[status] || 'info'
}

const getGroupStatusLabel = (status: string) => {
  const statuses: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  }
  return statuses[status] || 'Desconocido'
}

const getGroupStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    pending: 'info',
  }
  return severities[status] || 'secondary'
}

const getAttemptStatusLabel = (status: string) => {
  const statuses: Record<string, string> = {
    in_progress: 'En Progreso',
    completed: 'Completado',
    abandoned: 'Abandonado',
  }
  return statuses[status] || status
}

const getAttemptStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    in_progress: 'warning',
    completed: 'success',
    abandoned: 'danger',
  }
  return severities[status] || 'secondary'
}

// Lifecycle
onMounted(() => {
  loadStudentData()
})
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
