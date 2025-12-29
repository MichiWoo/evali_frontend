<template>
  <div class="documentation-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-book"></i>
        </div>
        <h1 class="hero-title">Documentación</h1>
        <p class="hero-subtitle">Guías completas para usar Evali</p>
        <p class="hero-description">
          Aprende a utilizar todas las funcionalidades de Evali con nuestras guías detalladas,
          tutoriales paso a paso y ejemplos prácticos.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Search Section -->
      <div class="section">
        <div class="search-container">
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input
              type="text"
              placeholder="Buscar en la documentación..."
              v-model="searchQuery"
              @input="filterContent"
            />
          </div>
        </div>
      </div>

      <!-- Quick Start Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-play-circle"></i>
          <h2>Inicio Rápido</h2>
        </div>
        <div class="quick-start-grid">
          <div class="quick-start-card" @click="scrollToSection('getting-started')">
            <div class="card-icon">
              <i class="pi pi-rocket"></i>
            </div>
            <h3>Primeros Pasos</h3>
            <p>Configura tu cuenta y crea tu primer examen en minutos</p>
            <div class="card-badge">5 min</div>
          </div>

          <div class="quick-start-card" @click="scrollToSection('exams')">
            <div class="card-icon">
              <i class="pi pi-file-edit"></i>
            </div>
            <h3>Crear Exámenes</h3>
            <p>Aprende a crear exámenes efectivos con diferentes tipos de preguntas</p>
            <div class="card-badge">10 min</div>
          </div>

          <div class="quick-start-card" @click="scrollToSection('students')">
            <div class="card-icon">
              <i class="pi pi-users"></i>
            </div>
            <h3>Gestionar Estudiantes</h3>
            <p>Organiza tus estudiantes en grupos y asigna exámenes</p>
            <div class="card-badge">8 min</div>
          </div>

          <div class="quick-start-card" @click="scrollToSection('results')">
            <div class="card-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3>Analizar Resultados</h3>
            <p>Interpreta los resultados y genera reportes detallados</p>
            <div class="card-badge">12 min</div>
          </div>
        </div>
      </div>

      <!-- Getting Started Section -->
      <div class="section" id="getting-started">
        <div class="section-header">
          <i class="pi pi-rocket"></i>
          <h2>Primeros Pasos</h2>
        </div>
        <div class="content-grid">
          <div class="content-card">
            <div class="step-number">1</div>
            <h3>Configuración Inicial</h3>
            <p>Configura tu perfil y personaliza la plataforma según tus necesidades.</p>
            <ul>
              <li>Completa tu información de perfil</li>
              <li>Configura las preferencias de la cuenta</li>
              <li>Personaliza la interfaz</li>
            </ul>
          </div>

          <div class="content-card">
            <div class="step-number">2</div>
            <h3>Crear tu Primer Grupo</h3>
            <p>Organiza a tus estudiantes en grupos para facilitar la gestión.</p>
            <ul>
              <li>Ve a la sección "Grupos"</li>
              <li>Haz clic en "Crear Grupo"</li>
              <li>Agrega estudiantes al grupo</li>
            </ul>
          </div>

          <div class="content-card">
            <div class="step-number">3</div>
            <h3>Crear tu Primer Examen</h3>
            <p>Diseña un examen con diferentes tipos de preguntas.</p>
            <ul>
              <li>Ve a "Exámenes" → "Crear Examen"</li>
              <li>Agrega preguntas de opción múltiple</li>
              <li>Configura la duración y fecha límite</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Exams Section -->
      <div class="section" id="exams">
        <div class="section-header">
          <i class="pi pi-file-edit"></i>
          <h2>Creación de Exámenes</h2>
        </div>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-question-circle"></i>
            </div>
            <h3>Tipos de Preguntas</h3>
            <p>Evali soporta múltiples tipos de preguntas para evaluaciones completas:</p>
            <ul>
              <li>
                <strong>Opción Múltiple:</strong> Una respuesta correcta entre varias opciones
              </li>
              <li><strong>Verdadero/Falso:</strong> Preguntas de afirmación o negación</li>
              <li><strong>Respuesta Corta:</strong> Respuestas de texto libre</li>
              <li><strong>Emparejamiento:</strong> Relacionar elementos de dos columnas</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-clock"></i>
            </div>
            <h3>Configuración de Tiempo</h3>
            <p>Controla el tiempo de duración de tus exámenes:</p>
            <ul>
              <li>Establece tiempo límite por examen</li>
              <li>Configura tiempo por pregunta</li>
              <li>Programa fechas de inicio y fin</li>
              <li>Configura intentos permitidos</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-shield"></i>
            </div>
            <h3>Configuraciones de Seguridad</h3>
            <p>Protege la integridad de tus exámenes:</p>
            <ul>
              <li>Orden aleatorio de preguntas</li>
              <li>Orden aleatorio de opciones</li>
              <li>Prevención de copia y pega</li>
              <li>Bloqueo de navegación</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Students Section -->
      <div class="section" id="students">
        <div class="section-header">
          <i class="pi pi-users"></i>
          <h2>Gestión de Estudiantes</h2>
        </div>
        <div class="content-grid">
          <div class="content-card">
            <h3>Crear y Gestionar Grupos</h3>
            <p>Organiza a tus estudiantes de manera eficiente:</p>
            <div class="code-block">
              <h4>Pasos para crear un grupo:</h4>
              <ol>
                <li>Ve a la sección "Grupos" en el menú principal</li>
                <li>Haz clic en "Crear Grupo"</li>
                <li>Ingresa el nombre del grupo</li>
                <li>Agrega una descripción (opcional)</li>
                <li>Selecciona los estudiantes a incluir</li>
                <li>Guarda el grupo</li>
              </ol>
            </div>
          </div>

          <div class="content-card">
            <h3>Asignar Exámenes a Grupos</h3>
            <p>Distribuye exámenes específicos a grupos determinados:</p>
            <div class="code-block">
              <h4>Proceso de asignación:</h4>
              <ol>
                <li>Selecciona el examen que deseas asignar</li>
                <li>Ve a la pestaña "Asignaciones"</li>
                <li>Selecciona los grupos objetivo</li>
                <li>Configura fechas de disponibilidad</li>
                <li>Envía notificaciones a los estudiantes</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="section" id="results">
        <div class="section-header">
          <i class="pi pi-chart-line"></i>
          <h2>Análisis de Resultados</h2>
        </div>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-chart-bar"></i>
            </div>
            <h3>Dashboard de Resultados</h3>
            <p>Visualiza estadísticas generales y tendencias:</p>
            <ul>
              <li>Promedio general por examen</li>
              <li>Distribución de calificaciones</li>
              <li>Comparativas entre grupos</li>
              <li>Evolución temporal de resultados</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-download"></i>
            </div>
            <h3>Exportación de Datos</h3>
            <p>Exporta resultados en diferentes formatos:</p>
            <ul>
              <li><strong>Excel (.xlsx):</strong> Para análisis detallado</li>
              <li><strong>PDF:</strong> Para reportes formales</li>
              <li>Filtros por fecha, grupo o estudiante</li>
              <li>Personalización de columnas incluidas</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-eye"></i>
            </div>
            <h3>Análisis Detallado</h3>
            <p>Profundiza en el rendimiento individual:</p>
            <ul>
              <li>Resultados por pregunta</li>
              <li>Tiempo de respuesta por estudiante</li>
              <li>Identificación de patrones de error</li>
              <li>Recomendaciones de mejora</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Advanced Features Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-cog"></i>
          <h2>Funcionalidades Avanzadas</h2>
        </div>
        <div class="advanced-grid">
          <div class="advanced-card">
            <div class="advanced-icon">
              <i class="pi pi-code"></i>
            </div>
            <h3>API y Integraciones</h3>
            <p>Integra Evali con otros sistemas educativos</p>
            <div class="advanced-content">
              <h4>Endpoints principales:</h4>
              <div class="code-snippet">
                <code>GET /api/v1/exams</code> - Listar exámenes<br />
                <code>POST /api/v1/exams</code> - Crear examen<br />
                <code>GET /api/v1/results/{exam_id}</code> - Obtener resultados
              </div>
            </div>
          </div>

          <div class="advanced-card">
            <div class="advanced-icon">
              <i class="pi pi-bell"></i>
            </div>
            <h3>Sistema de Notificaciones</h3>
            <p>Mantén a todos informados automáticamente</p>
            <div class="advanced-content">
              <h4>Tipos de notificaciones:</h4>
              <ul>
                <li>Nuevos exámenes asignados</li>
                <li>Recordatorios de fechas límite</li>
                <li>Resultados disponibles</li>
                <li>Actualizaciones del sistema</li>
              </ul>
            </div>
          </div>

          <div class="advanced-card">
            <div class="advanced-icon">
              <i class="pi pi-shield"></i>
            </div>
            <h3>Seguridad y Privacidad</h3>
            <p>Protección completa de datos educativos</p>
            <div class="advanced-content">
              <h4>Medidas de seguridad:</h4>
              <ul>
                <li>Encriptación de extremo a extremo</li>
                <li>Autenticación de dos factores</li>
                <li>Cumplimiento GDPR</li>
                <li>Auditoría de accesos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Troubleshooting Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-wrench"></i>
          <h2>Solución de Problemas</h2>
        </div>
        <div class="troubleshooting-grid">
          <div class="troubleshooting-item">
            <h3>Problemas de Acceso</h3>
            <div class="problem-solution">
              <p><strong>Problema:</strong> No puedo iniciar sesión</p>
              <p>
                <strong>Solución:</strong> Verifica tu email y contraseña. Si olvidaste tu
                contraseña, usa la opción "Recuperar contraseña".
              </p>
            </div>
          </div>

          <div class="troubleshooting-item">
            <h3>Problemas con Exámenes</h3>
            <div class="problem-solution">
              <p><strong>Problema:</strong> El examen no se carga correctamente</p>
              <p>
                <strong>Solución:</strong> Verifica tu conexión a internet y actualiza la página. Si
                persiste, contacta soporte.
              </p>
            </div>
          </div>

          <div class="troubleshooting-item">
            <h3>Problemas de Exportación</h3>
            <div class="problem-solution">
              <p><strong>Problema:</strong> No puedo exportar los resultados</p>
              <p>
                <strong>Solución:</strong> Asegúrate de tener permisos de exportación y que el
                examen tenga resultados disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Search functionality
const searchQuery = ref('')

const filterContent = () => {
  // Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

// Navigation methods
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.documentation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero Section */
.hero-section {
  padding: 4rem 2rem;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 2rem 2rem 0 0;
  margin-top: -2rem;
  position: relative;
  z-index: 1;
  padding: 3rem 2rem;
}

/* Section Styles */
.section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.section-header i {
  font-size: 2rem;
  color: #667eea;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

/* Search */
.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 2rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-box i {
  color: #667eea;
  font-size: 1.25rem;
  margin-right: 1rem;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 1.1rem;
  color: #2d3748;
}

.search-box input::placeholder {
  color: #a0aec0;
}

/* Quick Start */
.quick-start-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.quick-start-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.quick-start-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.quick-start-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.quick-start-card p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.content-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
}

.step-number {
  position: absolute;
  top: -1rem;
  left: 2rem;
  background: #667eea;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.content-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.content-card p {
  color: #4a5568;
  margin-bottom: 1rem;
}

.content-card ul {
  list-style: none;
  padding: 0;
}

.content-card li {
  color: #4a5568;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.content-card li::before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
}

/* Code Block */
.code-block {
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.code-block h4 {
  color: #81c784;
  margin-bottom: 1rem;
}

.code-block ol {
  margin: 0;
  padding-left: 1.5rem;
}

.code-block li {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
}

.feature-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #4a5568;
  margin-bottom: 1rem;
}

.feature-card ul {
  list-style: none;
  padding: 0;
}

.feature-card li {
  color: #4a5568;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.feature-card li::before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
}

/* Advanced Features */
.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.advanced-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
}

.advanced-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.advanced-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.advanced-card p {
  color: #4a5568;
  margin-bottom: 1rem;
}

.advanced-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.code-snippet {
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.advanced-content ul {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
}

.advanced-content li {
  color: #4a5568;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.advanced-content li::before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
}

/* Troubleshooting */
.troubleshooting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.troubleshooting-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
}

.troubleshooting-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.problem-solution {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.problem-solution p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.problem-solution strong {
  color: #2d3748;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .quick-start-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }

  .troubleshooting-grid {
    grid-template-columns: 1fr;
  }
}
</style>
