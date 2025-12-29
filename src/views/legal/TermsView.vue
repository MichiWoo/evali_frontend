<template>
  <div class="terms-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-file"></i>
        </div>
        <h1 class="hero-title">Términos y Condiciones</h1>
        <p class="hero-subtitle">Última actualización: {{ lastUpdated }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <!-- Introduction -->
        <div class="section">
          <p class="intro-text">
            Bienvenido a Evali. Al acceder y utilizar nuestra plataforma de evaluaciones educativas,
            aceptas cumplir con los siguientes términos y condiciones. Por favor, lee cuidadosamente
            este documento antes de utilizar nuestros servicios.
          </p>
        </div>

        <!-- Section 1 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-check-circle"></i>
            1. Aceptación de los Términos
          </h2>
          <p>Al registrarte y utilizar Evali, confirmas que:</p>
          <ul>
            <li>Tienes la capacidad legal para aceptar estos términos</li>
            <li>Proporcionarás información veraz y precisa</li>
            <li>Mantendrás la confidencialidad de tu cuenta y contraseña</li>
            <li>Serás responsable de todas las actividades realizadas bajo tu cuenta</li>
          </ul>
        </div>

        <!-- Section 2 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-user"></i>
            2. Uso de la Plataforma
          </h2>
          <h3>2.1. Usuarios Profesores</h3>
          <p>Como profesor, puedes:</p>
          <ul>
            <li>Crear y gestionar exámenes y evaluaciones</li>
            <li>Registrar y gestionar estudiantes</li>
            <li>Organizar estudiantes en grupos</li>
            <li>Ver y analizar resultados de exámenes</li>
            <li>Exportar datos y generar reportes</li>
          </ul>

          <h3>2.2. Usuarios Estudiantes</h3>
          <p>Como estudiante, puedes:</p>
          <ul>
            <li>Realizar exámenes asignados por tus profesores</li>
            <li>Ver tus resultados y calificaciones</li>
            <li>Acceder a información de tus grupos asignados</li>
          </ul>

          <h3>2.3. Uso Prohibido</h3>
          <p>Está estrictamente prohibido:</p>
          <ul>
            <li>Compartir credenciales de acceso con terceros</li>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Utilizar la plataforma para actividades ilegales</li>
            <li>Interferir con el funcionamiento del sistema</li>
            <li>Intentar vulnerar la seguridad de la plataforma</li>
            <li>Usar bots o scripts automatizados sin autorización</li>
            <li>Copiar, distribuir o modificar el contenido sin permiso</li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-credit-card"></i>
            3. Suscripciones y Pagos
          </h2>
          <h3>3.1. Planes de Suscripción</h3>
          <p>
            Evali ofrece diferentes planes de suscripción con características y límites diversos.
            Los precios y características están disponibles en la sección de planes.
          </p>

          <h3>3.2. Facturación</h3>
          <ul>
            <li>Los pagos se procesan mediante Stripe u otros proveedores de pago autorizados</li>
            <li>Las suscripciones se renuevan automáticamente según el período seleccionado</li>
            <li>Puedes cancelar tu suscripción en cualquier momento desde tu cuenta</li>
            <li>
              No se realizarán reembolsos por períodos no utilizados después de la cancelación
            </li>
          </ul>

          <h3>3.3. Cambios de Precio</h3>
          <p>
            Nos reservamos el derecho de modificar los precios de las suscripciones. Los cambios se
            comunicarán con al menos 30 días de anticipación.
          </p>
        </div>

        <!-- Section 4 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-shield"></i>
            4. Propiedad Intelectual
          </h2>
          <h3>4.1. Contenido del Usuario</h3>
          <p>
            Eres el único propietario del contenido que creas en la plataforma (exámenes, preguntas,
            etc.). Al utilizar Evali, nos otorgas una licencia no exclusiva para almacenar y
            procesar tu contenido para proporcionar el servicio.
          </p>

          <h3>4.2. Propiedad de Evali</h3>
          <p>
            La plataforma Evali, incluyendo su diseño, código, logotipos y marca, son propiedad de
            Evali. No puedes copiar, modificar o distribuir ningún elemento sin nuestro
            consentimiento escrito.
          </p>
        </div>

        <!-- Section 5 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-lock"></i>
            5. Privacidad y Protección de Datos
          </h2>
          <p>
            El manejo de tus datos personales se rige por nuestra
            <router-link to="/privacy" class="link">Política de Privacidad</router-link>. Al
            utilizar Evali, aceptas nuestras prácticas de privacidad.
          </p>
          <ul>
            <li>Protegemos tus datos personales y el contenido de tus evaluaciones</li>
            <li>No compartimos tus datos con terceros sin tu consentimiento</li>
            <li>Cumplimos con las regulaciones de protección de datos aplicables (GDPR, etc.)</li>
          </ul>
        </div>

        <!-- Section 6 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-ban"></i>
            6. Limitación de Responsabilidad
          </h2>
          <p>Evali se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que:</p>
          <ul>
            <li>El servicio esté siempre disponible sin interrupciones</li>
            <li>Los resultados sean completamente libres de errores</li>
            <li>El servicio satisfaga todos tus requisitos específicos</li>
          </ul>
          <p>
            No seremos responsables por daños indirectos, incidentales o consecuentes derivados del
            uso o la imposibilidad de usar la plataforma.
          </p>
        </div>

        <!-- Section 7 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-times-circle"></i>
            7. Terminación de Cuenta
          </h2>
          <h3>7.1. Terminación por el Usuario</h3>
          <p>
            Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil. Al
            cancelar, todos tus datos serán eliminados según nuestra política de retención de datos.
          </p>

          <h3>7.2. Terminación por Evali</h3>
          <p>Nos reservamos el derecho de suspender o terminar tu cuenta si:</p>
          <ul>
            <li>Violas estos términos y condiciones</li>
            <li>Realizas actividades fraudulentas o ilegales</li>
            <li>No realizas el pago de tu suscripción</li>
            <li>Compartes tu cuenta con otros usuarios</li>
          </ul>
        </div>

        <!-- Section 8 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-pencil"></i>
            8. Modificaciones de los Términos
          </h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
            importantes se comunicarán por correo electrónico o mediante notificación en la
            plataforma. El uso continuado de Evali después de los cambios constituye tu aceptación
            de los nuevos términos.
          </p>
        </div>

        <!-- Section 9 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-balance-scale"></i>
            9. Ley Aplicable y Jurisdicción
          </h2>
          <p>
            Estos términos se rigen por las leyes del país donde opera Evali. Cualquier disputa será
            resuelta en los tribunales competentes de esa jurisdicción.
          </p>
        </div>

        <!-- Section 10 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-envelope"></i>
            10. Contacto
          </h2>
          <p>Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos:</p>
          <ul>
            <li><strong>Email:</strong> legal@evali.com</li>
            <li><strong>Dirección:</strong> [Dirección de la empresa]</li>
            <li><strong>Teléfono:</strong> [Número de teléfono]</li>
          </ul>
          <p>
            También puedes visitar nuestra página de
            <router-link to="/support" class="link">Soporte</router-link> para más información.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="actions-section">
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            class="p-button-outlined"
            @click="goBack"
          />
          <Button
            label="Aceptar Términos"
            icon="pi pi-check"
            @click="acceptTerms"
            v-if="!termsAccepted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
const lastUpdated = ref('1 de Enero, 2025')
const termsAccepted = ref(false)

const goBack = () => {
  router.back()
}

const acceptTerms = () => {
  // Aquí puedes implementar la lógica para guardar la aceptación de términos
  termsAccepted.value = true
  router.push('/register')
}
</script>

<style scoped>
.terms-page {
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
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.9;
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

.container {
  max-width: 900px;
  margin: 0 auto;
}

/* Sections */
.section {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.section:last-of-type {
  border-bottom: none;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 2rem;
  text-align: center;
  font-style: italic;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.section-title i {
  color: #667eea;
  font-size: 1.5rem;
}

.section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.section p {
  font-size: 1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 1rem;
}

.section ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.section li {
  font-size: 1rem;
  line-height: 1.8;
  color: #4a5568;
  padding: 0.5rem 0;
  padding-left: 1.75rem;
  position: relative;
}

.section li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: 600;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Actions Section */
.actions-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .section-title {
    font-size: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-section {
    flex-direction: column;
    gap: 1rem;
  }

  .actions-section button {
    width: 100%;
  }
}
</style>
