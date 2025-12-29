<template>
  <div class="question-result" :class="questionClasses">
    <!-- Header de la pregunta -->
    <div class="question-header">
      <div class="question-number">
        <span class="number-badge">{{ questionNumber }}</span>
      </div>
      <div class="question-title-section">
        <h3 class="question-text" v-html="question.text"></h3>
        <div class="question-meta">
          <Badge
            :value="question.is_correct ? 'Correcta' : 'Incorrecta'"
            :severity="question.is_correct ? 'success' : 'danger'"
            :icon="question.is_correct ? 'pi pi-check-circle' : 'pi pi-times-circle'"
          />
          <span class="points-info">
            {{ question.earned_points }} / {{ question.points }} puntos
          </span>
        </div>
      </div>
    </div>

    <!-- Opciones para preguntas de opción múltiple -->
    <div v-if="question.type === 'multiple_choice'" class="options-container">
      <div
        v-for="(option, index) in question.options"
        :key="option.id"
        class="option-item"
        :class="getOptionClasses(option)"
      >
        <div class="option-indicator">
          <i v-if="option.is_correct" class="pi pi-check-circle option-icon correct-icon"></i>
          <i
            v-else-if="option.is_selected"
            class="pi pi-times-circle option-icon incorrect-icon"
          ></i>
          <i v-else class="pi pi-circle option-icon neutral-icon"></i>
        </div>
        <div class="option-content">
          <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
          <span class="option-text">{{ option.text }}</span>
        </div>
        <div class="option-badges">
          <Badge
            v-if="option.is_correct"
            value="Correcta"
            severity="success"
            class="option-badge"
          />
          <Badge
            v-if="option.is_selected && !option.is_correct"
            value="Tu respuesta"
            severity="danger"
            class="option-badge"
          />
          <Badge
            v-if="option.is_correct && !option.is_selected"
            value="Respuesta correcta"
            severity="info"
            class="option-badge"
          />
        </div>
      </div>
    </div>

    <!-- Respuesta para preguntas de texto o boolean -->
    <div v-else class="text-answer-container">
      <div
        class="answer-box student-answer"
        :class="{ correct: question.is_correct, incorrect: !question.is_correct }"
      >
        <div class="answer-label">
          <i :class="question.is_correct ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
          <span>Tu respuesta:</span>
        </div>
        <div class="answer-value">
          {{ question.selected_answer || 'Sin respuesta' }}
        </div>
      </div>

      <div v-if="!question.is_correct && question.correct_answer" class="answer-box correct-answer">
        <div class="answer-label">
          <i class="pi pi-check-circle"></i>
          <span>Respuesta correcta:</span>
        </div>
        <div class="answer-value">
          {{ question.correct_answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from 'primevue/badge'

const props = defineProps<{
  question: any
  questionNumber: number
}>()

const questionClasses = computed(() => {
  return {
    'question-correct': props.question.is_correct,
    'question-incorrect': !props.question.is_correct,
  }
})

const getOptionClasses = (option: any) => {
  return {
    'option-correct': option.is_correct,
    'option-selected': option.is_selected,
    'option-selected-incorrect': option.is_selected && !option.is_correct,
    'option-missing-correct': option.is_correct && !option.is_selected,
  }
}
</script>

<style scoped>
.question-result {
  background: var(--surface-card);
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.question-result.question-correct {
  border-left: 4px solid var(--green-500);
  background: linear-gradient(to right, rgba(34, 197, 94, 0.05) 0%, var(--surface-card) 4%);
}

.question-result.question-incorrect {
  border-left: 4px solid var(--red-500);
  background: linear-gradient(to right, rgba(239, 68, 68, 0.05) 0%, var(--surface-card) 4%);
}

.question-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.question-number {
  flex-shrink: 0;
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.125rem;
}

.question-title-section {
  flex: 1;
}

.question-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.points-info {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  background: var(--surface-ground);
  transition: all 0.2s ease;
}

.option-item.option-correct {
  background: linear-gradient(to right, rgba(34, 197, 94, 0.1) 0%, var(--surface-ground) 100%);
  border-color: var(--green-300);
}

.option-item.option-selected-incorrect {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.1) 0%, var(--surface-ground) 100%);
  border-color: var(--red-300);
}

.option-item.option-missing-correct {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.1) 0%, var(--surface-ground) 100%);
  border-color: var(--blue-300);
}

.option-indicator {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-icon {
  font-size: 1.5rem;
}

.correct-icon {
  color: var(--green-600);
}

.incorrect-icon {
  color: var(--red-600);
}

.neutral-icon {
  color: var(--text-color-secondary);
}

.option-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-label {
  font-weight: 700;
  color: var(--text-color-secondary);
  min-width: 24px;
}

.option-text {
  color: var(--text-color);
  line-height: 1.5;
}

.option-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.option-badge {
  font-size: 0.75rem;
}

.text-answer-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-box {
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid;
}

.answer-box.student-answer.correct {
  background: linear-gradient(to right, rgba(34, 197, 94, 0.1) 0%, transparent 100%);
  border-color: var(--green-300);
}

.answer-box.student-answer.incorrect {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.1) 0%, transparent 100%);
  border-color: var(--red-300);
}

.answer-box.correct-answer {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
  border-color: var(--blue-300);
}

.answer-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color-secondary);
}

.answer-label i {
  font-size: 1rem;
}

.student-answer.correct .answer-label i {
  color: var(--green-600);
}

.student-answer.incorrect .answer-label i {
  color: var(--red-600);
}

.correct-answer .answer-label i {
  color: var(--blue-600);
}

.answer-value {
  font-size: 1rem;
  color: var(--text-color);
  padding: 0.75rem;
  background: var(--surface-ground);
  border-radius: 6px;
  word-break: break-word;
}

@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .option-badges {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
