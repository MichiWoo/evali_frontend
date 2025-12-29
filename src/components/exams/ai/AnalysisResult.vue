<template>
  <div class="analysis-result">
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>Análisis de Respuesta</span>
          <Tag
            v-if="analysis.suggested_score !== null"
            :value="`${analysis.suggested_score.toFixed(1)}/100`"
            severity="info"
          />
        </div>
      </template>
      <template #content>
        <div v-if="analysis.status === 'processing'" class="text-center py-4">
          <ProgressSpinner />
          <p class="mt-3">Analizando respuesta...</p>
        </div>

        <div v-else-if="analysis.status === 'completed'">
          <!-- Puntuación Sugerida -->
          <div class="mb-4">
            <h4 class="mb-2">Puntuación Sugerida</h4>
            <div class="flex align-items-center gap-3">
              <ProgressBar
                :value="analysis.suggested_score || 0"
                :showValue="true"
                class="flex-1"
              />
              <span class="text-2xl font-bold">{{ analysis.suggested_score?.toFixed(1) }}/100</span>
            </div>
          </div>

          <!-- Retroalimentación -->
          <div class="mb-4" v-if="analysis.feedback">
            <h4 class="mb-2">Retroalimentación</h4>
            <div class="p-3 bg-surface-100 border-round">
              <p class="m-0">{{ analysis.feedback }}</p>
            </div>
          </div>

          <!-- Fortalezas -->
          <div class="mb-4" v-if="analysis.strengths && analysis.strengths.length > 0">
            <h4 class="mb-2">Fortalezas</h4>
            <ul class="list-none p-0 m-0">
              <li
                v-for="(strength, index) in analysis.strengths"
                :key="index"
                class="flex align-items-center gap-2 mb-2"
              >
                <i class="pi pi-check-circle text-green-500"></i>
                <span>{{ strength }}</span>
              </li>
            </ul>
          </div>

          <!-- Debilidades -->
          <div class="mb-4" v-if="analysis.weaknesses && analysis.weaknesses.length > 0">
            <h4 class="mb-2">Áreas de Mejora</h4>
            <ul class="list-none p-0 m-0">
              <li
                v-for="(weakness, index) in analysis.weaknesses"
                :key="index"
                class="flex align-items-center gap-2 mb-2"
              >
                <i class="pi pi-exclamation-circle text-orange-500"></i>
                <span>{{ weakness }}</span>
              </li>
            </ul>
          </div>

          <!-- Métricas de Análisis -->
          <div v-if="analysis.analysis_result?.analysis_details" class="mb-4">
            <h4 class="mb-2">Métricas de Análisis</h4>
            <div class="grid">
              <div
                class="col-12 md:col-3"
                v-if="analysis.analysis_result.analysis_details.completeness"
              >
                <div class="text-center p-3 bg-surface-100 border-round">
                  <p class="text-sm text-muted-color mb-1">Completitud</p>
                  <p class="text-2xl font-bold">
                    {{ (analysis.analysis_result.analysis_details.completeness * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
              <div
                class="col-12 md:col-3"
                v-if="analysis.analysis_result.analysis_details.accuracy"
              >
                <div class="text-center p-3 bg-surface-100 border-round">
                  <p class="text-sm text-muted-color mb-1">Precisión</p>
                  <p class="text-2xl font-bold">
                    {{ (analysis.analysis_result.analysis_details.accuracy * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
              <div class="col-12 md:col-3" v-if="analysis.analysis_result.analysis_details.clarity">
                <div class="text-center p-3 bg-surface-100 border-round">
                  <p class="text-sm text-muted-color mb-1">Claridad</p>
                  <p class="text-2xl font-bold">
                    {{ (analysis.analysis_result.analysis_details.clarity * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
              <div class="col-12 md:col-3" v-if="analysis.analysis_result.analysis_details.depth">
                <div class="text-center p-3 bg-surface-100 border-round">
                  <p class="text-sm text-muted-color mb-1">Profundidad</p>
                  <p class="text-2xl font-bold">
                    {{ (analysis.analysis_result.analysis_details.depth * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="analysis.status === 'failed'">
          <Message severity="error">
            {{ analysis.error_message || 'Error al analizar la respuesta' }}
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import type { AIAnswerAnalysis } from '@/types'

defineProps<{
  analysis: AIAnswerAnalysis
}>()
</script>

<style scoped>
.analysis-result {
  width: 100%;
}
</style>
