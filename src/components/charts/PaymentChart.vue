<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

Chart.register(...registerables)

interface Props {
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  data: ChartData
  options?: ChartOptions
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    responsive: true,
    maintainAspectRatio: false,
  }),
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const renderChart = () => {
  if (!chartCanvas.value) return

  // Destroy previous chart instance if it exists
  if (chart) {
    chart.destroy()
    chart = null
  }

  // Create new chart instance
  chart = new Chart(chartCanvas.value, {
    type: props.type,
    data: props.data,
    options: props.options,
  })
}

// Watch for changes in data or options
watch(
  [() => props.data, () => props.options],
  () => {
    if (chart) {
      chart.data = props.data
      if (props.options) {
        chart.options = props.options
      }
      chart.update()
    }
  },
  { deep: true },
)

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
