<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-96">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="card">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else-if="!group" class="card">
    <Message severity="warn" :closable="false">Grupo no encontrado</Message>
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
                {{ group.name }}
              </h1>
            </div>
            <p class="text-muted-color text-lg mb-4 max-w-2xl">
              {{ group.description || 'Sin descripción' }}
            </p>

            <!-- Status Badge -->
            <div class="flex items-center gap-3 mb-4">
              <Tag
                :value="getStatusLabel(group.status)"
                :severity="getStatusSeverity(group.status)"
                icon="pi pi-circle-fill"
              />
              <span class="text-muted-color">
                <i class="pi pi-calendar mr-2"></i>
                Creado {{ formatDate(group.created_at) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-row justify-center items-center gap-2">
            <Button
              icon="pi pi-pencil"
              label="Editar"
              @click="editGroup"
              class="p-button-primary"
            />
            <Button
              icon="pi pi-copy"
              label="Duplicar"
              @click="duplicateGroup"
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
                <span class="block text-muted-color font-medium mb-4">Estudiantes</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ group.users?.length || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-users text-blue-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ group.users?.length || 0 }} </span>
            <span class="text-muted-color"> estudiantes inscritos</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Exámenes</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ group.exams?.length || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-file text-orange-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ group.exams?.length || 0 }} </span>
            <span class="text-muted-color"> exámenes asignados</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Actividad</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ getActivityLevel() }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-chart-line text-cyan-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ getActivityLevel() }} </span>
            <span class="text-muted-color"> nivel de actividad</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Promedio</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ getAverageScore() }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-star text-purple-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ getAverageScore() }} </span>
            <span class="text-muted-color"> puntos promedio</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Details -->
    <div class="col-12 lg:col-6">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Información del Grupo</div>

        <div class="flex flex-col gap-4">
          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Estado</span>
            <Tag
              :value="getStatusLabel(group.status)"
              :severity="getStatusSeverity(group.status)"
            />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Estudiantes inscritos</span>
            <Tag :value="group.users?.length || 0" severity="primary" />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Exámenes asignados</span>
            <Tag :value="group.exams?.length || 0" severity="info" />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Fecha de creación</span>
            <Tag :value="formatDate(group.created_at)" severity="secondary" />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Última actualización</span>
            <Tag :value="formatDate(group.updated_at)" severity="secondary" />
          </div>

          <div class="flex items-center justify-between py-2">
            <span class="font-medium text-muted-color">ID del grupo</span>
            <Tag :value="group.id" severity="secondary" />
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
            label="Agregar Estudiantes"
            @click="addStudents"
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
            icon="pi pi-share-alt"
            label="Compartir Grupo"
            @click="shareGroup"
            class="p-button-outlined w-full justify-start"
          />
        </div>
      </div>
    </div>

    <!-- Students List -->
    <div class="col-12" v-if="group.users && group.users.length > 0">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Estudiantes del Grupo</div>
          <Button
            icon="pi pi-user-plus"
            label="Agregar Estudiante"
            @click="addStudents"
            class="p-button-sm"
          />
        </div>

        <DataTable
          :value="group.users"
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

          <Column field="name" header="Nombre" style="width: 30%">
            <template #body="slotProps">
              <div class="font-medium">
                {{
                  slotProps.data.name || slotProps.data.first_name + ' ' + slotProps.data.last_name
                }}
              </div>
              <div class="text-muted-color text-sm">{{ slotProps.data.email }}</div>
            </template>
          </Column>

          <Column field="email" header="Email" style="width: 25%">
            <template #body="slotProps">
              <span class="text-truncate max-w-md" :title="slotProps.data.email">
                {{ slotProps.data.email }}
              </span>
            </template>
          </Column>

          <Column field="status" header="Estado" style="width: 15%">
            <template #body="slotProps">
              <Tag
                :value="getStudentStatusLabel(slotProps.data.status)"
                :severity="getStudentStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>

          <Column field="joined_at" header="Fecha de Ingreso" style="width: 15%">
            <template #body="slotProps">
              <span class="text-sm">{{
                formatDate(slotProps.data.pivot?.created_at || slotProps.data.created_at)
              }}</span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 5%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  @click="viewStudent(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Ver estudiante'"
                />
                <Button
                  icon="pi pi-times"
                  @click="removeStudent(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm p-button-danger"
                  v-tooltip.top="'Remover del grupo'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Empty State for Students -->
    <div class="col-12" v-else>
      <div class="card text-center py-8">
        <i class="pi pi-users text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          No hay estudiantes en este grupo
        </h3>
        <p class="text-muted-color mb-4">Agrega estudiantes para comenzar a gestionar el grupo</p>
        <Button
          icon="pi pi-user-plus"
          label="Agregar Primer Estudiante"
          @click="addStudents"
          class="p-button-primary"
        />
      </div>
    </div>

    <!-- Assigned Exams -->
    <div class="col-12" v-if="group.exams && group.exams.length > 0">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Exámenes Asignados</div>
          <Button
            icon="pi pi-file-plus"
            label="Asignar Examen"
            @click="assignExams"
            class="p-button-sm"
          />
        </div>

        <DataTable
          :value="group.exams"
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

          <Column field="title" header="Título" style="width: 40%">
            <template #body="slotProps">
              <div class="font-medium">{{ slotProps.data.title }}</div>
              <div class="text-muted-color text-sm">
                {{ slotProps.data.description || 'Sin descripción' }}
              </div>
            </template>
          </Column>

          <Column field="duration" header="Duración" style="width: 15%">
            <template #body="slotProps">
              <span class="font-semibold">{{ slotProps.data.duration || '∞' }} min</span>
            </template>
          </Column>

          <Column field="max_attempts" header="Intentos" style="width: 15%">
            <template #body="slotProps">
              <span class="font-semibold">{{ slotProps.data.max_attempts || '∞' }}</span>
            </template>
          </Column>

          <Column field="created_at" header="Asignado" style="width: 15%">
            <template #body="slotProps">
              <span class="text-sm">{{
                formatDate(slotProps.data.pivot?.created_at || slotProps.data.created_at)
              }}</span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 5%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  @click="viewExam(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Ver examen'"
                />
                <Button
                  icon="pi pi-times"
                  @click="removeExam(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm p-button-danger"
                  v-tooltip.top="'Desasignar examen'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Empty State for Exams -->
    <div class="col-12" v-else>
      <div class="card text-center py-8">
        <i class="pi pi-file text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          No hay exámenes asignados a este grupo
        </h3>
        <p class="text-muted-color mb-4">
          Asigna exámenes para que los estudiantes puedan realizarlos
        </p>
        <Button
          icon="pi pi-file-plus"
          label="Asignar Primer Examen"
          @click="assignExams"
          class="p-button-primary"
        />
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog />

  <!-- Add Students Dialog -->
  <Dialog
    v-model:visible="showAddStudentsDialog"
    modal
    header="Agregar Estudiantes al Grupo"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="flex flex-col gap-4">
      <!-- Search -->
      <div class="field">
        <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
          Buscar Estudiantes
        </label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Buscar por nombre o email..."
            class="w-full"
            @input="onSearchChange"
          />
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingStudents" class="flex justify-center items-center py-8">
        <ProgressSpinner />
      </div>

      <!-- Students List -->
      <div
        v-else-if="availableStudents.length > 0"
        class="border border-surface-200 dark:border-surface-700 rounded-lg"
        style="max-height: 400px; overflow-y: auto"
      >
        <DataTable
          :value="availableStudents"
          v-model:selection="selectedStudents"
          selectionMode="multiple"
          dataKey="id"
          :paginator="true"
          :rows="10"
          class="p-datatable-sm"
          stripedRows
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

          <Column field="name" header="Nombre">
            <template #body="slotProps">
              <div class="font-medium">{{ slotProps.data.name }}</div>
            </template>
          </Column>

          <Column field="email" header="Email">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.email }}</span>
            </template>
          </Column>

          <Column field="status" header="Estado">
            <template #body="slotProps">
              <Tag
                :value="getStudentStatusLabel(slotProps.data.status)"
                :severity="getStudentStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 text-muted-color">
        <i class="pi pi-users text-4xl mb-3"></i>
        <p>
          {{
            searchQuery
              ? 'No se encontraron estudiantes con ese criterio'
              : 'No hay estudiantes disponibles para agregar'
          }}
        </p>
      </div>

      <!-- Selected Count -->
      <div
        v-if="selectedStudents.length > 0"
        class="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
      >
        <i class="pi pi-check-circle text-primary"></i>
        <span class="font-medium text-surface-900 dark:text-surface-0">
          {{ selectedStudents.length }} estudiante(s) seleccionado(s)
        </span>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        @click="showAddStudentsDialog = false; selectedStudents = []; searchQuery = ''"
        severity="secondary"
        outlined
      />
      <Button
        label="Agregar Estudiantes"
        icon="pi pi-check"
        @click="handleAddStudents"
        :disabled="selectedStudents.length === 0 || isLoading"
        :loading="isLoading"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/groups'
import { useStudentStore } from '@/stores/students'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

// Components
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

// Composables
const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const studentStore = useStudentStore()
const confirm = useConfirm()
const toast = useToast()

// State
const groupId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const group = computed(() => groupStore.currentGroup)

// Methods
const loadGroup = async () => {
  try {
    isLoading.value = true
    error.value = null
    await groupStore.fetchGroup(groupId.value)
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el grupo'
    console.error('Error loading group:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/groups')
}

const editGroup = () => {
  router.push(`/groups/${groupId.value}/edit`)
}

const duplicateGroup = async () => {
  try {
    // TODO: Implementar duplicación
    toast.add({
      severity: 'info',
      summary: 'Función pendiente',
      detail: 'La duplicación de grupos estará disponible pronto',
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al duplicar el grupo',
    })
  }
}

const confirmDelete = () => {
  confirm.require({
    message: '¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await groupStore.deleteGroup(groupId.value)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Grupo eliminado correctamente',
        })
        router.push('/groups')
      } catch (err: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error al eliminar el grupo',
        })
      }
    },
  })
}

const showAddStudentsDialog = ref(false)
const searchQuery = ref('')
const availableStudents = ref<any[]>([])
const selectedStudents = ref<any[]>([])
const isLoadingStudents = ref(false)

const addStudents = () => {
  showAddStudentsDialog.value = true
  loadAvailableStudents()
}

const loadAvailableStudents = async () => {
  try {
    isLoadingStudents.value = true
    await studentStore.fetchStudents()

    // Filtrar estudiantes que ya están en el grupo
    const currentStudentIds = group.value?.users?.map((u) => u.id) || []
    availableStudents.value = studentStore.students.filter(
      (student) => !currentStudentIds.includes(student.id),
    )

    // Si hay búsqueda, filtrar también
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      availableStudents.value = availableStudents.value.filter(
        (student) =>
          student.name.toLowerCase().includes(query) || student.email.toLowerCase().includes(query),
      )
    }
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al cargar estudiantes',
      life: 5000,
    })
  } finally {
    isLoadingStudents.value = false
  }
}

const onSearchChange = () => {
  loadAvailableStudents()
}

const handleAddStudents = async () => {
  if (selectedStudents.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Selección requerida',
      detail: 'Debes seleccionar al menos un estudiante',
      life: 3000,
    })
    return
  }

  try {
    isLoading.value = true

    // Agregar estudiantes uno por uno
    for (const student of selectedStudents.value) {
      await groupStore.addUserToGroup(groupId.value, student.id)
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `${selectedStudents.value.length} estudiante(s) agregado(s) correctamente`,
      life: 3000,
    })

    // Limpiar y cerrar
    selectedStudents.value = []
    searchQuery.value = ''
    showAddStudentsDialog.value = false

    // Recargar el grupo
    await loadGroup()
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al agregar estudiantes',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
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

const shareGroup = () => {
  // TODO: Implementar compartir
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'Compartir grupo estará disponible pronto',
  })
}

const viewStudent = (studentId: number) => {
  router.push(`/students/${studentId}`)
}

const removeStudent = async (studentId: number) => {
  confirm.require({
    message: '¿Estás seguro de que quieres remover este estudiante del grupo?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await groupStore.removeUserFromGroup(groupId.value, studentId)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Estudiante removido del grupo',
        })
        await loadGroup() // Recargar datos
      } catch (err: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error al remover estudiante',
        })
      }
    },
  })
}

const viewExam = (examId: number) => {
  router.push(`/exams/${examId}`)
}

const removeExam = async (_examId: number) => {
  try {
    // TODO: Implementar desasignar examen
    toast.add({
      severity: 'info',
      summary: 'Función pendiente',
      detail: 'Desasignar examen estará disponible pronto',
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al desasignar examen',
    })
  }
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
    archived: 'Archivado',
  }
  return statuses[status] || status
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    archived: 'secondary',
  }
  return severities[status] || 'info'
}

const getStudentStatusLabel = (status: string) => {
  const statuses: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  }
  return statuses[status] || 'Desconocido'
}

const getStudentStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    pending: 'info',
  }
  return severities[status] || 'secondary'
}

const getActivityLevel = () => {
  const studentCount = group.value?.users?.length || 0
  const examCount = group.value?.exams?.length || 0

  if (studentCount === 0) return 'Inactivo'
  if (studentCount < 5 && examCount < 2) return 'Bajo'
  if (studentCount < 15 && examCount < 5) return 'Medio'
  return 'Alto'
}

const getAverageScore = () => {
  // TODO: Implementar cálculo de promedio real
  return 'N/A'
}

// Lifecycle
onMounted(() => {
  loadGroup()
})
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
