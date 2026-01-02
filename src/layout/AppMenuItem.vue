<script setup>
  import { useLayout } from '@/layout/composables/layout';
  import { onBeforeMount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const { layoutState, setActiveMenuItem, toggleMenu } = useLayout();

  const props = defineProps({
      item: {
          type: Object,
          default: () => ({})
      },
      index: {
          type: Number,
          default: 0
      },
      root: {
          type: Boolean,
          default: true
      },
      parentItemKey: {
          type: String,
          default: null
      },
      siblingItems: {
          type: Array,
          default: () => []
      }
  });

  const isActiveMenu = ref(false);
  const itemKey = ref(null);

  onBeforeMount(() => {
      itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

      const activeItem = layoutState.activeMenuItem;

      isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
  });

  watch(
      () => layoutState.activeMenuItem,
      (newVal) => {
          isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
      }
  );

  function itemClick(event, item) {
      if (item.disabled) {
          event.preventDefault();
          return;
      }

      if ((item.to || item.url) && (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)) {
          toggleMenu();
      }

      if (item.command) {
          item.command({ originalEvent: event, item: item });
      }

      const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

      setActiveMenuItem(foundItemKey);
  }

  /**
   * Verifica si la ruta actual coincide con el item del menú
   * Soporta coincidencias exactas y rutas que comienzan con la ruta del item (para rutas anidadas)
   * Pero evita activar rutas padre cuando hay rutas hermanas más específicas
   */
  function checkActiveRoute(item) {
      if (!item.to) return false;

      const currentPath = route.path;
      const itemPath = item.to;

      // Coincidencia exacta
      if (currentPath === itemPath) {
          return true;
      }

      // Si la ruta actual comienza con la ruta del item (para rutas anidadas como /exams/:id)
      // pero solo si no hay rutas hermanas más específicas en el mismo nivel
      if (itemPath !== '/' && currentPath.startsWith(itemPath + '/')) {
          // Verificar si hay items hermanos que coincidan exactamente con la ruta actual
          // Si es así, no activar este item porque hay un item más específico
          if (props.siblingItems && props.siblingItems.length > 0) {
              const hasExactSiblingMatch = props.siblingItems.some(sibling =>
                  sibling.to === currentPath
              );
              if (hasExactSiblingMatch) {
                  return false; // No activar si un hermano coincide exactamente
              }
          }

          // Si el item tiene hijos, verificar si algún hijo coincide exactamente
          if (item.items && item.items.length > 0) {
              const hasExactChildMatch = item.items.some(child => child.to === currentPath);
              if (hasExactChildMatch) {
                  return false; // No activar el padre si un hijo coincide exactamente
              }
          }

          // Verificar si la ruta adicional parece ser un ID (para rutas como /exams/123)
          // Si no es un ID, probablemente es una ruta hermana (como /grades/groups)
          const pathSegments = currentPath.split('/').filter(s => s);
          const itemPathSegments = itemPath.split('/').filter(s => s);

          if (pathSegments.length === itemPathSegments.length + 1) {
              const extraSegment = pathSegments[itemPathSegments.length];
              // Si el segmento extra no parece ser un ID (no es numérico ni UUID),
              // probablemente es una ruta hermana como /grades/groups
              const isLikelyId = /^\d+$/.test(extraSegment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(extraSegment);
              if (!isLikelyId) {
                  // Es probablemente una ruta hermana, no activar el item padre
                  return false;
              }
          }

          return true;
      }

      return false;
  }
  </script>

  <template>
      <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
          <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">{{ item.label }}</div>
          <a v-if="(!item.to || item.items) && item.visible !== false" :href="item.url" @click="itemClick($event, item, index)" :class="item.class" :target="item.target" tabindex="0">
              <i :class="item.icon" class="layout-menuitem-icon"></i>
              <span class="layout-menuitem-text">{{ item.label }}</span>
              <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
          </a>
          <router-link v-if="item.to && !item.items && item.visible !== false" @click="itemClick($event, item, index)" :class="[item.class, { 'active-route': checkActiveRoute(item) }]" tabindex="0" :to="item.to">
              <i :class="item.icon" class="layout-menuitem-icon"></i>
              <span class="layout-menuitem-text">{{ item.label }}</span>
              <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
          </router-link>
          <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
              <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
                  <app-menu-item v-for="(child, i) in item.items" :key="child" :index="i" :item="child" :parentItemKey="itemKey" :root="false" :siblingItems="item.items"></app-menu-item>
              </ul>
          </Transition>
      </li>
  </template>

  <style lang="scss" scoped></style>
