<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-4">
          <Button
            icon="pi pi-arrow-left"
            text
            @click="goBack"
            class="p-button-sm"
            v-tooltip.top="'Volver al examen'"
          />
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
            Crear Nueva Pregunta
          </h1>
        </div>

        <p class="text-muted-color mb-6" v-if="exam">
          Agregando pregunta al examen: <strong>{{ exam.title }}</strong>
        </p>

        <!-- Loading State -->
        <div v-if="isLoadingExam" class="flex justify-center items-center py-8">
          <ProgressSpinner />
        </div>

        <!-- Error State -->
        <Message v-if="examError" severity="error" :closable="false" class="mb-4">
          {{ examError }}
        </Message>

        <!-- Form -->
        <form v-if="exam && !isLoadingExam" @submit.prevent="handleSubmit">
          <div class="grid">
            <!-- Question Text -->
            <div class="col-12">
              <div class="field">
                <label
                  for="text"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Texto de la Pregunta <span class="text-red-500">*</span>
                </label>
                <Editor v-model="formData.text" editorStyle="height: 200px" />
                <small v-if="errors.text" class="p-error">{{ errors.text }}</small>
                <small class="text-muted-color mt-2 block">
                  Usa el editor para formatear el texto de la pregunta con negritas, listas, etc.
                </small>
              </div>
            </div>

            <!-- Question Type and Points -->
            <div class="col-12 lg:col-6">
              <div class="field">
                <label
                  for="type"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Tipo de Pregunta <span class="text-red-500">*</span>
                </label>
                <Select
                  id="type"
                  v-model="formData.type"
                  :options="questionTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecciona el tipo"
                  class="w-full"
                  :class="{ 'p-invalid': errors.type }"
                  @change="onTypeChange"
                />
                <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <div class="field">
                <label
                  for="points"
                  class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                >
                  Puntos <span class="text-red-500">*</span>
                </label>
                <InputNumber
                  id="points"
                  v-model="formData.points"
                  :min="0"
                  :max="100"
                  :step="0.5"
                  placeholder="0"
                  class="w-full"
                  :class="{ 'p-invalid': errors.points }"
                />
                <small v-if="errors.points" class="p-error">{{ errors.points }}</small>
              </div>
            </div>

            <!-- Multiple Choice Options -->
            <div class="col-12" v-if="formData.type === 'multiple_choice'">
              <div class="card mb-0">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 m-0">
                    Opciones de Respuesta
                  </h3>
                  <Button
                    icon="pi pi-plus"
                    label="Agregar Opción"
                    @click="addOption"
                    class="p-button-sm"
                    :disabled="options.length >= 10"
                  />
                </div>

                <div v-if="options.length === 0" class="text-center py-4 text-muted-color">
                  No hay opciones. Agrega al menos 2 opciones para una pregunta de opción múltiple.
                </div>

                <div v-else class="flex flex-col gap-3">
                  <div
                    v-for="(option, index) in options"
                    :key="index"
                    class="flex gap-3 items-start p-3 border border-surface-200 dark:border-surface-700 rounded-lg"
                  >
                    <div class="flex-1">
                      <div class="field mb-0">
                        <InputText
                          v-model="option.text"
                          :placeholder="`Opción ${index + 1}`"
                          class="w-full"
                          :class="{ 'p-invalid': !option.text.trim() && submitted }"
                        />
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <Checkbox v-model="option.is_correct" :binary="true" inputId="correct" />
                      <label
                        for="correct"
                        class="text-sm font-medium text-surface-900 dark:text-surface-0"
                      >
                        Correcta
                      </label>
                      <Button
                        icon="pi pi-trash"
                        @click="removeOption(index)"
                        class="p-button-text p-button-danger p-button-sm"
                        :disabled="options.length <= 2"
                        v-tooltip.top="'Eliminar opción'"
                      />
                    </div>
                  </div>
                </div>

                <small v-if="optionsError" class="p-error mt-2 block">{{ optionsError }}</small>
                <small class="text-muted-color mt-2 block">
                  Marca al menos una opción como correcta. Mínimo 2 opciones requeridas.
                </small>
              </div>
            </div>

            <!-- True/False Options -->
            <div class="col-12" v-if="formData.type === 'true_false'">
              <div class="card mb-0">
                <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
                  Respuesta Correcta
                </h3>
                <div class="flex gap-4">
                  <div class="flex-1">
                    <div
                      class="p-4 border rounded-lg cursor-pointer transition-all"
                      :class="
                        formData.meta?.correct_answer === true
                          ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:border-primary'
                      "
                      @click="formData.meta = { ...formData.meta, correct_answer: true }"
                    >
                      <div class="flex items-center gap-3">
                        <i
                          class="pi pi-check-circle text-2xl"
                          :class="
                            formData.meta?.correct_answer === true
                              ? 'text-primary'
                              : 'text-muted-color'
                          "
                        ></i>
                        <div>
                          <div class="font-semibold text-surface-900 dark:text-surface-0">
                            Verdadero
                          </div>
                          <div class="text-sm text-muted-color">Esta es la respuesta correcta</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div
                      class="p-4 border rounded-lg cursor-pointer transition-all"
                      :class="
                        formData.meta?.correct_answer === false
                          ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:border-primary'
                      "
                      @click="formData.meta = { ...formData.meta, correct_answer: false }"
                    >
                      <div class="flex items-center gap-3">
                        <i
                          class="pi pi-times-circle text-2xl"
                          :class="
                            formData.meta?.correct_answer === false
                              ? 'text-primary'
                              : 'text-muted-color'
                          "
                        ></i>
                        <div>
                          <div class="font-semibold text-surface-900 dark:text-surface-0">
                            Falso
                          </div>
                          <div class="text-sm text-muted-color">Esta es la respuesta correcta</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <small v-if="errors.meta" class="p-error mt-2 block">{{ errors.meta }}</small>
              </div>
            </div>

            <!-- Additional Options -->
            <div class="col-12">
              <div class="card mb-0">
                <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
                  Configuración Adicional
                </h3>

                <div class="grid">
                  <div class="col-12 lg:col-6">
                    <div class="field">
                      <label
                        for="difficulty"
                        class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                      >
                        Dificultad
                      </label>
                      <Select
                        id="difficulty"
                        v-model="formData.meta.difficulty"
                        :options="difficultyOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona la dificultad"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="col-12 lg:col-6">
                    <div class="field">
                      <label
                        for="hint"
                        class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                      >
                        Pista (Opcional)
                      </label>
                      <InputText
                        id="hint"
                        v-model="formData.meta.hint"
                        placeholder="Escribe una pista para ayudar al estudiante"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="field">
                      <label
                        for="explanation"
                        class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
                      >
                        Explicación (Opcional)
                      </label>
                      <Textarea
                        id="explanation"
                        v-model="formData.meta.explanation"
                        placeholder="Explica por qué esta respuesta es correcta..."
                        rows="3"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="col-12">
              <div class="flex justify-end gap-3">
                <Button
                  label="Cancelar"
                  @click="goBack"
                  severity="secondary"
                  outlined
                  :disabled="isLoading"
                />
                <Button
                  type="submit"
                  label="Crear Pregunta"
                  icon="pi pi-check"
                  :loading="isLoading"
                  :disabled="isLoading"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exams'
import { useQuestionStore } from '@/stores/questions'
import { useToast } from 'primevue/usetoast'
import type { CreateQuestionRequest } from '@/types'

// Components
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Editor from 'primevue/editor'

// Composables
const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const questionStore = useQuestionStore()
const toast = useToast()

// State
const examId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const isLoadingExam = ref(false)
const examError = ref<string | null>(null)
const submitted = ref(false)
const optionsError = ref<string | null>(null)

const exam = ref(examStore.currentExam)

// Question Types
const questionTypes = [
  { label: 'Opción Múltiple', value: 'multiple_choice' },
  { label: 'Verdadero/Falso', value: 'true_false' },
  { label: 'Respuesta Abierta', value: 'open' },
]

// Difficulty Options
const difficultyOptions = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Medio', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
]

// Form Data
const formData = reactive<CreateQuestionRequest>({
  exam_id: examId.value,
  text: '',
  type: 'multiple_choice',
  points: 1,
  meta: {
    difficulty: undefined,
    hint: undefined,
    explanation: undefined,
    options: [],
  },
})

// Options for multiple choice
const options = ref<Array<{ text: string; is_correct: boolean }>>([
  { text: '', is_correct: false },
  { text: '', is_correct: false },
])

// Errors
const errors = ref<Record<string, string>>({})

// Methods
const loadExam = async () => {
  try {
    isLoadingExam.value = true
    examError.value = null

    if (!exam.value || exam.value.id !== examId.value) {
      await examStore.fetchExam(examId.value)
      exam.value = examStore.currentExam
    }

    if (!exam.value) {
      examError.value = 'Examen no encontrado'
    }
  } catch (err: any) {
    examError.value = err.message || 'Error al cargar el examen'
    console.error('Error loading exam:', err)
  } finally {
    isLoadingExam.value = false
  }
}

const onTypeChange = () => {
  // Reset options when changing type
  if (formData.type === 'multiple_choice') {
    options.value = [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ]
  } else if (formData.type === 'true_false') {
    formData.meta = {
      ...formData.meta,
      correct_answer: undefined,
    }
  }
  optionsError.value = null
}

const addOption = () => {
  if (options.value.length < 10) {
    options.value.push({ text: '', is_correct: false })
  }
}

const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1)
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  optionsError.value = null
  let isValid = true

  // Validate text
  if (!formData.text || !formData.text.trim()) {
    errors.value.text = 'El texto de la pregunta es obligatorio'
    isValid = false
  } else {
    // Remove HTML tags to check if there's actual content
    const textContent = formData.text.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      errors.value.text = 'El texto de la pregunta no puede estar vacío'
      isValid = false
    }
  }

  // Validate type
  if (!formData.type) {
    errors.value.type = 'El tipo de pregunta es obligatorio'
    isValid = false
  }

  // Validate points
  if (!formData.points || formData.points <= 0) {
    errors.value.points = 'Los puntos deben ser mayores a 0'
    isValid = false
  }

  // Validate multiple choice options
  if (formData.type === 'multiple_choice') {
    const validOptions = options.value.filter((opt) => opt.text.trim())

    if (validOptions.length < 2) {
      optionsError.value = 'Debes agregar al menos 2 opciones'
      isValid = false
    }

    const hasCorrectAnswer = validOptions.some((opt) => opt.is_correct)
    if (!hasCorrectAnswer) {
      optionsError.value = 'Debes marcar al menos una opción como correcta'
      isValid = false
    }

    // Store valid options in meta
    formData.meta = {
      ...formData.meta,
      options: validOptions.map((opt) => ({
        text: opt.text.trim(),
        is_correct: opt.is_correct,
      })),
    }
  }

  // Validate true/false
  if (formData.type === 'true_false') {
    if (formData.meta?.correct_answer === undefined) {
      errors.value.meta = 'Debes seleccionar la respuesta correcta (Verdadero o Falso)'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  submitted.value = true

  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Por favor, completa todos los campos requeridos correctamente',
      life: 3000,
    })
    return
  }

  try {
    isLoading.value = true

    // Prepare question data
    const questionData: CreateQuestionRequest = {
      exam_id: examId.value,
      text: formData.text,
      type: formData.type,
      points: formData.points,
      meta: {
        ...formData.meta,
      },
    }

    // Clean up meta - remove undefined values
    if (questionData.meta) {
      Object.keys(questionData.meta).forEach((key) => {
        if (questionData.meta![key as keyof typeof questionData.meta] === undefined) {
          delete questionData.meta![key as keyof typeof questionData.meta]
        }
      })

      // Remove meta if it's empty
      if (Object.keys(questionData.meta).length === 0) {
        delete questionData.meta
      }
    }

    await questionStore.createQuestion(questionData)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Pregunta creada correctamente',
      life: 3000,
    })

    // Redirect back to exam detail
    router.push(`/exams/${examId.value}`)
  } catch (err: any) {
    console.error('Error creating question:', err)

    if (err.response?.status === 422) {
      const validationErrors = err.response.data.errors
      Object.keys(validationErrors).forEach((key) => {
        errors.value[key] = validationErrors[key][0]
      })
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al crear la pregunta',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push(`/exams/${examId.value}`)
}

// Lifecycle
onMounted(() => {
  loadExam()
})
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style>
