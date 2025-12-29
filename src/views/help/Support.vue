<template>
  <div class="support-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-question-circle"></i>
        </div>
        <h1 class="hero-title">Centro de Soporte</h1>
        <p class="hero-subtitle">Estamos aquí para ayudarte</p>
        <p class="hero-description">
          Encuentra respuestas rápidas, contacta con nuestro equipo de soporte o explora nuestra
          documentación completa.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Quick Actions -->
      <div class="section">
        <div class="section-header">
          <i class="pi pi-bolt"></i>
          <h2>Acciones Rápidas</h2>
        </div>
        <div class="quick-actions">
          <div class="action-card" @click="scrollToSection('faq')">
            <div class="action-icon">
              <i class="pi pi-question"></i>
            </div>
            <h3>Preguntas Frecuentes</h3>
            <p>Encuentra respuestas a las preguntas más comunes</p>
          </div>

          <div class="action-card" @click="scrollToSection('contact')">
            <div class="action-icon">
              <i class="pi pi-envelope"></i>
            </div>
            <h3>Contactar Soporte</h3>
            <p>Envía un ticket de soporte o contáctanos directamente</p>
          </div>

          <div class="action-card" @click="scrollToSection('documentation')">
            <div class="action-icon">
              <i class="pi pi-book"></i>
            </div>
            <h3>Documentación</h3>
            <p>Guías detalladas y tutoriales paso a paso</p>
          </div>

          <div class="action-card" @click="scrollToSection('status')">
            <div class="action-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3>Estado del Sistema</h3>
            <p>Verifica el estado actual de nuestros servicios</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="section" id="faq">
        <div class="section-header">
          <i class="pi pi-question-circle"></i>
          <h2>Preguntas Frecuentes</h2>
        </div>
        <div class="faq-container">
          <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
            <div class="faq-question" @click="toggleFaq(index)">
              <h3>{{ faq.question }}</h3>
              <i class="pi" :class="faq.open ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            </div>
            <div class="faq-answer" v-show="faq.open">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="section" id="contact">
        <div class="section-header">
          <i class="pi pi-envelope"></i>
          <h2>Contactar Soporte</h2>
        </div>
        <div class="contact-methods">
          <div class="contact-card">
            <div class="contact-icon">
              <i class="pi pi-ticket"></i>
            </div>
            <h3>Ticket de Soporte</h3>
            <p>Envía una solicitud detallada y recibe respuesta en 24 horas</p>
            <Button
              label="Crear Ticket"
              icon="pi pi-plus"
              class="p-button-outlined"
              @click="createTicket"
            />
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <i class="pi pi-envelope"></i>
            </div>
            <h3>Email Directo</h3>
            <p>soporte@evali.com</p>
            <Button
              label="Enviar Email"
              icon="pi pi-send"
              class="p-button-outlined"
              @click="sendEmail"
            />
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <i class="pi pi-phone"></i>
            </div>
            <h3>Teléfono</h3>
            <p>+1 (555) 123-4567</p>
            <p class="contact-hours">Lunes - Viernes: 9:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>

      <!-- Documentation Section -->
      <div class="section" id="documentation">
        <div class="section-header">
          <i class="pi pi-book"></i>
          <h2>Documentación y Recursos</h2>
        </div>
        <div class="documentation-grid">
          <div class="doc-card">
            <div class="doc-icon">
              <i class="pi pi-play-circle"></i>
            </div>
            <h3>Guías de Inicio</h3>
            <p>Tutoriales paso a paso para comenzar a usar Evali</p>
            <ul>
              <li>Configuración inicial</li>
              <li>Crear tu primer examen</li>
              <li>Gestionar estudiantes</li>
            </ul>
          </div>

          <div class="doc-card">
            <div class="doc-icon">
              <i class="pi pi-cog"></i>
            </div>
            <h3>Configuración Avanzada</h3>
            <p>Configuraciones avanzadas y personalización</p>
            <ul>
              <li>Configuración de grupos</li>
              <li>Personalización de reportes</li>
              <li>Integraciones API</li>
            </ul>
          </div>

          <div class="doc-card">
            <div class="doc-icon">
              <i class="pi pi-shield"></i>
            </div>
            <h3>Seguridad y Privacidad</h3>
            <p>Información sobre seguridad y protección de datos</p>
            <ul>
              <li>Política de privacidad</li>
              <li>Medidas de seguridad</li>
              <li>Cumplimiento GDPR</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- System Status Section -->
      <div class="section" id="status">
        <div class="section-header">
          <i class="pi pi-chart-line"></i>
          <h2>Estado del Sistema</h2>
        </div>
        <div class="status-container">
          <div class="status-item">
            <div class="status-indicator operational"></div>
            <div class="status-info">
              <h3>Servidor Principal</h3>
              <p>Operacional - Tiempo de respuesta: 45ms</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-indicator operational"></div>
            <div class="status-info">
              <h3>Base de Datos</h3>
              <p>Operacional - Sin problemas reportados</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-indicator operational"></div>
            <div class="status-info">
              <h3>API de Exportación</h3>
              <p>Operacional - Funcionando correctamente</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-indicator maintenance"></div>
            <div class="status-info">
              <h3>Servicios de Notificación</h3>
              <p>Mantenimiento programado - 2 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'

// FAQ Data
const faqs = ref([
  {
    question: '¿Cómo puedo crear mi primer examen?',
    answer:
      'Para crear un examen, ve a la sección "Exámenes" en el menú principal, haz clic en "Crear Examen" y sigue el asistente paso a paso. Puedes agregar preguntas de diferentes tipos y configurar la duración del examen.',
    open: false,
  },
  {
    question: '¿Puedo exportar los resultados en diferentes formatos?',
    answer:
      'Sí, Evali permite exportar resultados tanto en formato Excel (.xlsx) como PDF. Puedes acceder a esta función desde la sección de resultados de cualquier examen.',
    open: false,
  },
  {
    question: '¿Cómo gestiono los grupos de estudiantes?',
    answer:
      'En la sección "Grupos" puedes crear, editar y eliminar grupos de estudiantes. También puedes asignar exámenes específicos a grupos determinados para una mejor organización.',
    open: false,
  },
  {
    question: '¿Es seguro mi información y la de mis estudiantes?',
    answer:
      'Absolutamente. Evali utiliza encriptación de extremo a extremo, cumple con estándares de seguridad internacionales y está diseñado para proteger la privacidad de todos los usuarios.',
    open: false,
  },
  {
    question: '¿Puedo personalizar los reportes de resultados?',
    answer:
      'Sí, puedes personalizar los reportes seleccionando qué información incluir, aplicar filtros por fecha, grupo o estudiante, y elegir entre diferentes formatos de visualización.',
    open: false,
  },
  {
    question: '¿Hay límites en el número de exámenes o estudiantes?',
    answer:
      'Los límites dependen de tu plan de suscripción. El plan gratuito incluye hasta 5 exámenes y 50 estudiantes, mientras que los planes premium ofrecen capacidades ilimitadas.',
    open: false,
  },
])

// Methods
const toggleFaq = (index: number) => {
  faqs.value[index].open = !faqs.value[index].open
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const createTicket = () => {
  // Implementar lógica para crear ticket
  console.log('Crear ticket de soporte')
}

const sendEmail = () => {
  window.location.href = 'mailto:soporte@evali.com?subject=Soporte Evali'
}
</script>

<style scoped>
.support-page {
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

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.action-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.action-card p {
  color: #4a5568;
  line-height: 1.6;
}

/* FAQ */
.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  overflow: hidden;
}

.faq-question {
  background: #f8fafc;
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background: #edf2f7;
}

.faq-question h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  background: white;
}

.faq-answer p {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

/* Contact Methods */
.contact-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.contact-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
}

.contact-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.contact-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.contact-card p {
  color: #4a5568;
  margin-bottom: 1rem;
}

.contact-hours {
  font-size: 0.875rem;
  color: #718096;
  font-style: italic;
}

/* Documentation */
.documentation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.doc-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
}

.doc-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.doc-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.doc-card p {
  color: #4a5568;
  margin-bottom: 1rem;
}

.doc-card ul {
  list-style: none;
  padding: 0;
}

.doc-card li {
  color: #4a5568;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.doc-card li::before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
}

/* System Status */
.status-container {
  max-width: 600px;
  margin: 0 auto;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: white;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
}

.status-indicator.operational {
  background: #48bb78;
}

.status-indicator.maintenance {
  background: #ed8936;
}

.status-indicator.down {
  background: #f56565;
}

.status-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.status-info p {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0;
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

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .contact-methods {
    grid-template-columns: 1fr;
  }

  .documentation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
