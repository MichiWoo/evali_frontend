<template>
  <div class="privacy-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-shield"></i>
        </div>
        <h1 class="hero-title">Política de Privacidad</h1>
        <p class="hero-subtitle">Última actualización: {{ lastUpdated }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <!-- Introduction -->
        <div class="section">
          <p class="intro-text">
            En Evali, nos comprometemos a proteger tu privacidad y la seguridad de tus datos
            personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos,
            almacenamos y protegemos tu información cuando utilizas nuestra plataforma de
            evaluaciones educativas.
          </p>
        </div>

        <!-- Section 1 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-info-circle"></i>
            1. Información que Recopilamos
          </h2>

          <h3>1.1. Información Personal</h3>
          <p>Recopilamos la siguiente información personal cuando te registras y utilizas Evali:</p>
          <ul>
            <li>
              <strong>Información de Cuenta:</strong> Nombre, dirección de correo electrónico,
              contraseña
            </li>
            <li><strong>Información de Perfil:</strong> Foto de perfil, biografía (opcional)</li>
            <li>
              <strong>Información de Pago:</strong> Datos de tarjeta de crédito (procesados de forma
              segura por Stripe)
            </li>
            <li>
              <strong>Información de Uso:</strong> Registro de actividades, tiempo de uso, funciones
              utilizadas
            </li>
          </ul>

          <h3>1.2. Información de Contenido Educativo</h3>
          <p>Al utilizar Evali, también almacenamos:</p>
          <ul>
            <li>Exámenes y preguntas que crees</li>
            <li>Respuestas de estudiantes a exámenes</li>
            <li>Calificaciones y resultados</li>
            <li>Grupos y organizaciones de estudiantes</li>
          </ul>

          <h3>1.3. Información Técnica</h3>
          <p>Recopilamos automáticamente:</p>
          <ul>
            <li>Dirección IP</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Fecha y hora de acceso</li>
            <li>Cookies y tecnologías similares</li>
          </ul>
        </div>

        <!-- Section 2 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-cog"></i>
            2. Cómo Utilizamos tu Información
          </h2>

          <h3>2.1. Proporcionar el Servicio</h3>
          <p>Utilizamos tu información para:</p>
          <ul>
            <li>Crear y gestionar tu cuenta</li>
            <li>Procesar tus pagos y suscripciones</li>
            <li>Permitirte crear y gestionar exámenes</li>
            <li>Facilitar la comunicación entre profesores y estudiantes</li>
            <li>Proporcionar soporte técnico</li>
          </ul>

          <h3>2.2. Mejora del Servicio</h3>
          <p>Analizamos los datos de uso para:</p>
          <ul>
            <li>Mejorar la funcionalidad de la plataforma</li>
            <li>Identificar y corregir errores</li>
            <li>Desarrollar nuevas características</li>
            <li>Personalizar tu experiencia</li>
          </ul>

          <h3>2.3. Comunicación</h3>
          <p>Podemos utilizar tu correo electrónico para:</p>
          <ul>
            <li>Enviar notificaciones importantes sobre tu cuenta</li>
            <li>Informarte sobre actualizaciones del servicio</li>
            <li>Proporcionar soporte al cliente</li>
            <li>Enviar comunicaciones promocionales (puedes optar por no recibirlas)</li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-share-alt"></i>
            3. Compartir Información
          </h2>

          <h3>3.1. No Vendemos tu Información</h3>
          <p>
            No vendemos, alquilamos ni compartimos tu información personal con terceros para sus
            propios fines comerciales.
          </p>

          <h3>3.2. Proveedores de Servicios</h3>
          <p>
            Podemos compartir información con proveedores de servicios de confianza que nos ayudan a
            operar:
          </p>
          <ul>
            <li><strong>Procesadores de Pago:</strong> Stripe para procesar pagos</li>
            <li>
              <strong>Hosting y Almacenamiento:</strong> Servicios en la nube para almacenar datos
            </li>
            <li><strong>Análisis:</strong> Herramientas para analizar el uso del servicio</li>
            <li><strong>Correo Electrónico:</strong> Servicios para enviar notificaciones</li>
          </ul>
          <p>
            Estos proveedores solo pueden utilizar tu información para proporcionarnos el servicio y
            están obligados a mantener la confidencialidad.
          </p>

          <h3>3.3. Requisitos Legales</h3>
          <p>Podemos divulgar información si es requerido por ley o para:</p>
          <ul>
            <li>Cumplir con órdenes judiciales o procesos legales</li>
            <li>Proteger nuestros derechos y seguridad</li>
            <li>Prevenir fraude o actividad ilegal</li>
            <li>Responder a solicitudes gubernamentales</li>
          </ul>
        </div>

        <!-- Section 4 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-lock"></i>
            4. Seguridad de los Datos
          </h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu
            información:
          </p>
          <ul>
            <li>
              <strong>Encriptación:</strong> Todos los datos se transmiten mediante conexiones
              encriptadas (HTTPS/TLS)
            </li>
            <li>
              <strong>Almacenamiento Seguro:</strong> Los datos se almacenan en servidores seguros
              con acceso restringido
            </li>
            <li>
              <strong>Autenticación:</strong> Requerimos contraseñas seguras y verificación de email
            </li>
            <li>
              <strong>Monitoreo:</strong> Monitoreamos continuamente el sistema para detectar
              actividades sospechosas
            </li>
            <li>
              <strong>Copias de Seguridad:</strong> Realizamos copias de seguridad regulares de los
              datos
            </li>
            <li>
              <strong>Acceso Limitado:</strong> Solo el personal autorizado tiene acceso a los datos
              personales
            </li>
          </ul>
          <p class="warning-text">
            Sin embargo, ningún sistema es 100% seguro. Te recomendamos que utilices contraseñas
            fuertes y no compartas tu cuenta con otros usuarios.
          </p>
        </div>

        <!-- Section 5 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-calendar"></i>
            5. Retención de Datos
          </h2>
          <p>Conservamos tu información personal mientras:</p>
          <ul>
            <li>Tu cuenta esté activa</li>
            <li>Sea necesario para proporcionar el servicio</li>
            <li>Sea requerido por ley o para resolver disputas</li>
          </ul>
          <p>
            Cuando canceles tu cuenta, eliminaremos tu información personal según nuestra política
            de retención, excepto cuando la ley requiera que la conservemos por más tiempo.
          </p>
          <p>
            Los datos educativos (exámenes, resultados) pueden conservarse por períodos más largos
            según los requisitos legales educativos aplicables.
          </p>
        </div>

        <!-- Section 6 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-globe"></i>
            6. Tus Derechos de Privacidad
          </h2>
          <p>Según las leyes de protección de datos aplicables (como GDPR), tienes derecho a:</p>

          <h3>6.1. Acceso</h3>
          <p>
            Puedes acceder a tu información personal a través de tu cuenta o solicitándola
            directamente.
          </p>

          <h3>6.2. Rectificación</h3>
          <p>
            Puedes corregir o actualizar tu información personal en cualquier momento desde tu
            perfil.
          </p>

          <h3>6.3. Eliminación</h3>
          <p>
            Puedes solicitar la eliminación de tu cuenta y datos personales. Algunos datos pueden
            conservarse por requisitos legales.
          </p>

          <h3>6.4. Portabilidad</h3>
          <p>
            Puedes solicitar una copia de tus datos en un formato estructurado y legible por
            máquina.
          </p>

          <h3>6.5. Oposición</h3>
          <p>
            Puedes oponerte al procesamiento de tus datos para ciertos fines, como marketing
            directo.
          </p>

          <h3>6.6. Restricción</h3>
          <p>
            Puedes solicitar que restrinjamos el procesamiento de tus datos en ciertas
            circunstancias.
          </p>
        </div>

        <!-- Section 7 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-cookie"></i>
            7. Cookies y Tecnologías Similares
          </h2>
          <p>Utilizamos cookies y tecnologías similares para:</p>
          <ul>
            <li>Mantener tu sesión activa</li>
            <li>Recordar tus preferencias</li>
            <li>Analizar el uso de la plataforma</li>
            <li>Mejorar la funcionalidad</li>
          </ul>
          <p>
            Puedes controlar las cookies a través de la configuración de tu navegador. Sin embargo,
            deshabilitar ciertas cookies puede afectar la funcionalidad de la plataforma.
          </p>
        </div>

        <!-- Section 8 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-users"></i>
            8. Datos de Menores de Edad
          </h2>
          <p>
            Evali está dirigido a usuarios mayores de 13 años. Si eres un profesor que registra
            estudiantes menores de edad, eres responsable de obtener el consentimiento de los padres
            o tutores legales según las leyes aplicables.
          </p>
          <p>
            No recopilamos intencionalmente información personal de menores de 13 años sin el
            consentimiento de los padres. Si descubrimos que hemos recopilado información de menores
            sin consentimiento, la eliminaremos inmediatamente.
          </p>
        </div>

        <!-- Section 9 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-globe"></i>
            9. Transferencias Internacionales
          </h2>
          <p>
            Tus datos pueden ser transferidos y almacenados en servidores ubicados fuera de tu país.
            Cuando esto ocurre, nos aseguramos de que existan salvaguardias adecuadas para proteger
            tu información según los estándares de protección de datos aplicables.
          </p>
        </div>

        <!-- Section 10 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-pencil"></i>
            10. Cambios a esta Política
          </h2>
          <p>
            Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre
            cambios significativos mediante:
          </p>
          <ul>
            <li>Correo electrónico a la dirección asociada con tu cuenta</li>
            <li>Notificación visible en la plataforma</li>
            <li>Actualización de la fecha de "Última actualización"</li>
          </ul>
          <p>
            Te recomendamos revisar esta política periódicamente para estar informado sobre cómo
            protegemos tu información.
          </p>
        </div>

        <!-- Section 11 -->
        <div class="section">
          <h2 class="section-title">
            <i class="pi pi-envelope"></i>
            11. Contacto
          </h2>
          <p>
            Si tienes preguntas, inquietudes o deseas ejercer tus derechos de privacidad, puedes
            contactarnos:
          </p>
          <ul>
            <li><strong>Email de Privacidad:</strong> privacy@evali.com</li>
            <li><strong>Email General:</strong> support@evali.com</li>
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
          <router-link to="/terms">
            <Button
              label="Ver Términos y Condiciones"
              icon="pi pi-file"
              class="p-button-outlined"
            />
          </router-link>
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

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.privacy-page {
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
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: 600;
  font-size: 1.2rem;
}

.section li strong {
  color: #2d3748;
  font-weight: 600;
}

.warning-text {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-style: italic;
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
  gap: 1rem;
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
  }

  .actions-section button,
  .actions-section a {
    width: 100%;
  }
}
</style>
