<script setup>
  import { ref, computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  import AppMenuItem from './AppMenuItem.vue';

  const authStore = useAuthStore();

  // Menú base completo (para admins)
  const baseModel = [
      {
          label: 'Inicio',
          items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
      },
      {
          label: 'Exámenes',
          items: [
              { label: 'Todos los Exámenes', icon: 'pi pi-fw pi-file', to: '/exams' },
              { label: 'Generar con IA', icon: 'pi pi-fw pi-sparkles', to: '/exams/ai/generate' }
          ]
      },
      {
          label: 'Resultados',
          items: [
              { label: 'Dashboard de Resultados', icon: 'pi pi-fw pi-chart-bar', to: '/grades' },
              { label: 'Resultados por Grupo', icon: 'pi pi-fw pi-sitemap', to: '/grades/groups' },
              { label: 'Resultados por Examen', icon: 'pi pi-fw pi-file', to: '/grades/exams' }
          ]
      },
      {
          label: 'Grupos',
          items: [
              { label: 'Mis Grupos', icon: 'pi pi-fw pi-sitemap', to: '/groups' },
              { label: 'Gestionar Grupos', icon: 'pi pi-fw pi-cog', to: '/groups/manage' }
          ]
      },
      {
          label: 'Estudiantes',
          items: [
              { label: 'Lista de Estudiantes', icon: 'pi pi-fw pi-users', to: '/students' }
          ]
      },
      {
          label: 'Notificaciones',
          items: [
              { label: 'Todas las Notificaciones', icon: 'pi pi-fw pi-bell', to: '/notifications' }
          ]
      },
      {
          label: 'Pagos y Suscripciones',
          items: [
              { label: 'Dashboard de Pagos', icon: 'pi pi-fw pi-chart-pie', to: '/payments' },
              { label: 'Historial de Pagos', icon: 'pi pi-fw pi-list', to: '/payments/history' },
              { label: 'Métodos de Pago', icon: 'pi pi-fw pi-credit-card', to: '/payments/methods' },
              { label: 'Facturas', icon: 'pi pi-fw pi-file-pdf', to: '/payments/invoices' },
              { label: 'Suscripción', icon: 'pi pi-fw pi-id-card', to: '/subscriptions' },
              { label: 'Planes', icon: 'pi pi-fw pi-tags', to: '/plans' }
          ]
      },
      {
          label: 'Administración',
          items: [
              { label: 'Usuarios', icon: 'pi pi-fw pi-user', to: '/admin/users' },
              { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/admin/settings' },
              { label: 'Reportes', icon: 'pi pi-fw pi-chart-line', to: '/admin/reports' }
          ]
      },
      {
          label: 'Perfil',
          items: [
              { label: 'Mi Perfil', icon: 'pi pi-fw pi-user', to: '/profile' },
              { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/profile/settings' },
              { label: 'Seguridad', icon: 'pi pi-fw pi-shield', to: '/profile/security' }
          ]
      },
      {
          label: 'Ayuda',
          items: [
              { label: 'Documentación', icon: 'pi pi-fw pi-book', to: '/help' },
              { label: 'Soporte', icon: 'pi pi-fw pi-question-circle', to: '/support' },
              { label: 'Acerca de', icon: 'pi pi-fw pi-info-circle', to: '/about' }
          ]
      }
  ];

  // Menú específico para estudiantes
  const studentMenu = [
      {
          label: 'Inicio',
          items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/student/dashboard' }]
      },
      {
          label: 'Exámenes',
          items: [
              { label: 'Mis Exámenes', icon: 'pi pi-fw pi-file', to: '/student/exams' }
          ]
      },
      {
          label: 'Resultados',
          items: [
              { label: 'Mis Resultados', icon: 'pi pi-fw pi-chart-bar', to: '/student/results' }
          ]
      },
      {
          label: 'Notificaciones',
          items: [
              { label: 'Todas las Notificaciones', icon: 'pi pi-fw pi-bell', to: '/notifications' }
          ]
      },
      {
          label: 'Perfil',
          items: [
              { label: 'Mi Perfil', icon: 'pi pi-fw pi-user', to: '/profile' },
              { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/profile/settings' },
              { label: 'Seguridad', icon: 'pi pi-fw pi-shield', to: '/profile/security' }
          ]
      },
      {
          label: 'Ayuda',
          items: [
              { label: 'Documentación', icon: 'pi pi-fw pi-book', to: '/help' },
              { label: 'Soporte', icon: 'pi pi-fw pi-question-circle', to: '/support' },
              { label: 'Acerca de', icon: 'pi pi-fw pi-info-circle', to: '/about' }
          ]
      }
  ];

  // Menú específico para profesores
  const teacherMenu = [
      {
          label: 'Inicio',
          items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
      },
      {
          label: 'Exámenes',
          items: [
              { label: 'Mis Exámenes', icon: 'pi pi-fw pi-file', to: '/exams' },
              { label: 'Generar con IA', icon: 'pi pi-fw pi-sparkles', to: '/exams/ai/generate' }
          ]
      },
      {
          label: 'Preguntas',
          items: [
              { label: 'Banco de Preguntas', icon: 'pi pi-fw pi-question-circle', to: '/questions' }
          ]
      },
      {
          label: 'Grupos',
          items: [
              { label: 'Mis Grupos', icon: 'pi pi-fw pi-sitemap', to: '/groups' }
          ]
      },
      {
          label: 'Estudiantes',
          items: [
              { label: 'Lista de Estudiantes', icon: 'pi pi-fw pi-users', to: '/students' }
          ]
      },
      {
          label: 'Resultados',
          items: [
              { label: 'Dashboard de Resultados', icon: 'pi pi-fw pi-chart-bar', to: '/grades' },
              { label: 'Resultados por Grupo', icon: 'pi pi-fw pi-sitemap', to: '/grades/groups' },
              { label: 'Resultados por Examen', icon: 'pi pi-fw pi-file', to: '/grades/exams' },
              { label: 'Análisis de Exámenes', icon: 'pi pi-fw pi-chart-line', to: '/teacher/results' }
          ]
      },
      {
          label: 'Notificaciones',
          items: [
              { label: 'Todas las Notificaciones', icon: 'pi pi-fw pi-bell', to: '/notifications' }
          ]
      },
      {
          label: 'Pagos y Suscripciones',
          items: [
              { label: 'Historial de Pagos', icon: 'pi pi-fw pi-list', to: '/payments/history' },
              { label: 'Métodos de Pago', icon: 'pi pi-fw pi-credit-card', to: '/payments/methods' },
              { label: 'Facturas', icon: 'pi pi-fw pi-file-pdf', to: '/payments/invoices' },
              { label: 'Suscripción', icon: 'pi pi-fw pi-id-card', to: '/subscriptions' },
              { label: 'Planes', icon: 'pi pi-fw pi-tags', to: '/plans' }
          ]
      },
      {
          label: 'Perfil',
          items: [
              { label: 'Mi Perfil', icon: 'pi pi-fw pi-user', to: '/profile' },
              { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/profile/settings' },
              { label: 'Seguridad', icon: 'pi pi-fw pi-shield', to: '/profile/security' }
          ]
      },
      {
          label: 'Ayuda',
          items: [
              { label: 'Documentación', icon: 'pi pi-fw pi-book', to: '/help' },
              { label: 'Soporte', icon: 'pi pi-fw pi-question-circle', to: '/support' },
              { label: 'Acerca de', icon: 'pi pi-fw pi-info-circle', to: '/about' }
          ]
      }
  ];

  const model = computed(() => {
      // Estudiantes: menú específico solo con opciones de estudiante
      if (authStore.isStudent && !authStore.isAdmin) {
          return studentMenu;
      }

      // Profesores: menú específico con opciones de profesor
      if (authStore.isTeacher && !authStore.isAdmin) {
          return teacherMenu;
      }

      // Administradores: menú completo con todas las opciones
      if (authStore.isAdmin) {
          return baseModel;
      }

      // Fallback: si no hay rol definido, mostrar menú vacío o mínimo
      return [
          {
              label: 'Perfil',
              items: [
                  { label: 'Mi Perfil', icon: 'pi pi-fw pi-user', to: '/profile' },
                  { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/profile/settings' },
                  { label: 'Seguridad', icon: 'pi pi-fw pi-shield', to: '/profile/security' }
              ]
          },
          {
              label: 'Ayuda',
              items: [
                  { label: 'Documentación', icon: 'pi pi-fw pi-book', to: '/help' },
                  { label: 'Soporte', icon: 'pi pi-fw pi-question-circle', to: '/support' },
                  { label: 'Acerca de', icon: 'pi pi-fw pi-info-circle', to: '/about' }
              ]
          }
      ];
  });
  </script>

  <template>
      <ul class="layout-menu">
          <template v-for="(item, i) in model" :key="item">
              <app-menu-item v-if="!item.separator" :item="item" :index="i" :siblingItems="item.items || []"></app-menu-item>
              <li v-if="item.separator" class="menu-separator"></li>
          </template>
      </ul>
  </template>

  <style lang="scss" scoped></style>
