<template>
  <div class="generation-parameters">
    <div class="grid">
      <div class="col-12">
        <h3 class="text-xl font-semibold mb-4">Parámetros de Generación</h3>
      </div>

      <div class="col-12 lg:col-6">
        <div class="field">
          <label for="num_questions" class="block font-medium mb-2">
            Número de Preguntas <span class="text-red-500">*</span>
          </label>
          <InputNumber
            id="num_questions"
            v-model="params.num_questions"
            :min="5"
            :max="50"
            :value="10"
            class="w-full"
            showButtons
          />
          <small class="text-muted-color">Entre 5 y 50 preguntas</small>
        </div>
      </div>

      <div class="col-12 lg:col-6">
        <div class="field">
          <label for="difficulty" class="block font-medium mb-2"> Dificultad </label>
          <Select
            id="difficulty"
            v-model="params.difficulty"
            :options="difficultyOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona dificultad"
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <label class="block font-medium mb-2">
            Tipos de Preguntas <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-wrap gap-3">
            <div v-for="type in questionTypes" :key="type.value" class="flex align-items-center">
              <Checkbox :inputId="type.value" :value="type.value" v-model="params.question_types" />
              <label :for="type.value" class="ml-2">{{ type.label }}</label>
            </div>
          </div>
          <small v-if="params.question_types.length === 0" class="p-error">
            Debes seleccionar al menos un tipo de pregunta
          </small>
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <Checkbox id="include_answer_key" v-model="params.include_answer_key" :binary="true" />
          <label for="include_answer_key" class="ml-2"> Incluir clave de respuestas </label>
        </div>
      </div>
    </div>

    <Divider />

    <div class="grid">
      <div class="col-12">
        <h3 class="text-xl font-semibold mb-4">Configuración del Examen</h3>
      </div>

      <div class="col-12 lg:col-6">
        <div class="field">
          <label for="time_limit" class="block font-medium mb-2"> Tiempo Límite (minutos) </label>
          <InputNumber
            id="time_limit"
            v-model="examSettings.time_limit_minutes"
            :min="1"
            :max="600"
            class="w-full"
            showButtons
          />
          <small class="text-muted-color">Opcional</small>
        </div>
      </div>

      <div class="col-12 lg:col-6">
        <div class="field">
          <label for="max_attempts" class="block font-medium mb-2"> Máximo Intentos </label>
          <InputNumber
            id="max_attempts"
            v-model="examSettings.max_attempts"
            :min="1"
            :max="10"
            :value="1"
            class="w-full"
            showButtons
          />
        </div>
      </div>

      <div class="col-12">
        <div class="field flex align-items-center">
          <Checkbox
            id="shuffle_questions"
            v-model="examSettings.shuffle_questions"
            :binary="true"
          />
          <label for="shuffle_questions" class="ml-2"> Aleatorizar orden de preguntas </label>
        </div>
      </div>

      <div class="col-12">
        <div class="field flex align-items-center">
          <Checkbox id="shuffle_options" v-model="examSettings.shuffle_options" :binary="true" />
          <label for="shuffle_options" class="ml-2"> Aleatorizar orden de opciones </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import type { GenerateExamParams } from '@/types'

const props = defineProps<{
  modelValue: GenerateExamParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GenerateExamParams): void
}>()

const params = ref({
  num_questions: props.modelValue.parameters.num_questions || 10,
  question_types: props.modelValue.parameters.question_types || ['multiple_choice'],
  difficulty: props.modelValue.parameters.difficulty || 'medium',
  include_answer_key: props.modelValue.parameters.include_answer_key ?? true,
})

const examSettings = ref({
  time_limit_minutes: props.modelValue.exam_settings.time_limit_minutes,
  max_attempts: props.modelValue.exam_settings.max_attempts || 1,
  shuffle_questions: props.modelValue.exam_settings.shuffle_questions || false,
  shuffle_options: props.modelValue.exam_settings.shuffle_options || false,
})

const difficultyOptions = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Media', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
]

const questionTypes = [
  { label: 'Opción Múltiple', value: 'multiple_choice' },
  { label: 'Verdadero/Falso', value: 'true_false' },
  { label: 'Abiertas', value: 'open' },
]

watch(
  [params, examSettings],
  () => {
    emit('update:modelValue', {
      ...props.modelValue,
      parameters: {
        ...params.value,
        language: 'es',
      },
      exam_settings: examSettings.value,
    })
  },
  { deep: true },
)
</script>

<style scoped>
.generation-parameters {
  width: 100%;
}
</style>
