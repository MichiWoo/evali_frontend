<template>
  <div class="about-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-graduation-cap"></i>
        </div>
        <h1 class="hero-title">Evali</h1>
        <p class="hero-subtitle">Sistema de Evaluación Educativa Inteligente</p>
        <p class="hero-description">
          Una plataforma moderna y completa para la gestión de exámenes, evaluación de estudiantes y
          análisis de resultados académicos.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Mission Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-target"></i>
          <h2>Nuestra Misión</h2>
        </div>
        <div class="section-content">
          <p>
            Transformar la educación mediante tecnología innovadora que facilite la evaluación, el
            seguimiento del progreso académico y la toma de decisiones basadas en datos para mejorar
            el aprendizaje de los estudiantes.
          </p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-star"></i>
          <h2>Características Principales</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-file-edit"></i>
            </div>
            <h3>Creación de Exámenes</h3>
            <p>
              Herramientas intuitivas para crear exámenes personalizados con diferentes tipos de
              preguntas.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-users"></i>
            </div>
            <h3>Gestión de Estudiantes</h3>
            <p>
              Administra grupos de estudiantes, asigna exámenes y realiza seguimiento individual.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3>Análisis de Resultados</h3>
            <p>
              Reportes detallados y análisis estadísticos para evaluar el rendimiento académico.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-shield"></i>
            </div>
            <h3>Seguridad y Privacidad</h3>
            <p>Protección de datos con encriptación y controles de acceso basados en roles.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-download"></i>
            </div>
            <h3>Exportación de Datos</h3>
            <p>Exporta resultados en formato Excel y PDF para análisis externos y reportes.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-mobile"></i>
            </div>
            <h3>Diseño Responsivo</h3>
            <p>
              Interfaz adaptativa que funciona perfectamente en dispositivos móviles y de
              escritorio.
            </p>
          </div>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-chart-bar"></i>
          <h2>Estadísticas del Sistema</h2>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.exams }}</div>
            <div class="stat-label">Exámenes Creados</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.students }}</div>
            <div class="stat-label">Estudiantes Activos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.questions }}</div>
            <div class="stat-label">Preguntas en Banco</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.results }}</div>
            <div class="stat-label">Resultados Evaluados</div>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-users"></i>
          <h2>Nuestro Equipo</h2>
        </div>
        <div class="team-content">
          <p>
            Evali es desarrollado por un equipo de profesionales apasionados por la educación y la
            tecnología, comprometidos con la innovación y la excelencia en el desarrollo de
            soluciones educativas.
          </p>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-envelope"></i>
          <h2>Contacto</h2>
        </div>
        <div class="contact-info">
          <div class="contact-item">
            <i class="pi pi-envelope"></i>
            <span>soporte@evali.com</span>
          </div>
          <div class="contact-item">
            <i class="pi pi-phone"></i>
            <span>+1 (555) 123-4567</span>
          </div>
          <div class="contact-item">
            <i class="pi pi-map-marker"></i>
            <span>Ciudad de México, México</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Statistics data
const stats = ref({
  exams: 0,
  students: 0,
  questions: 0,
  results: 0,
})

// Animate statistics on mount
onMounted(() => {
  // Simulate loading statistics
  setTimeout(() => {
    stats.value = {
      exams: 156,
      students: 1247,
      questions: 3420,
      results: 8934,
    }
  }, 500)
})
</script>

<style scoped>
.about-page {
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
  padding: 3rem 2rem 4rem 2rem;
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

.section-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4a5568;
  max-width: 800px;
}

/* Features Grid */
.features-grid {
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
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
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
  line-height: 1.6;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: scale(1.05);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

/* Team Section */
.team-content {
  max-width: 800px;
}

.team-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4a5568;
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: #4a5568;
}

.contact-item i {
  color: #667eea;
  font-size: 1.25rem;
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

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .contact-info {
    align-items: center;
  }
}
</style>
