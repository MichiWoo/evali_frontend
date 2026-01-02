<script setup></script>

<template>
    <div class="layout-footer">
        <div class="footer-content">
            <p>&copy; 2025 Evali. Todos los derechos reservados.</p>
            <p class="footer-attribution">
                Desarrollado con
                <a href="https://primevue.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">PrimeVue</a>
            </p>
        </div>
    </div>
</template>

<style scoped>
.layout-footer {
    padding: 1rem;
    text-align: center;
    background: var(--surface-card);
    border-top: 1px solid var(--surface-border);
}

.footer-content p {
    margin: 0.25rem 0;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

.footer-attribution {
    opacity: 0.8;
}
</style>

