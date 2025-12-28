# Multi-stage build para optimizar el tamaño de la imagen
FROM node:20-alpine AS builder

# Build arguments para variables de entorno
ARG VITE_API_BASE_URL=https://api.tudominio.com
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_APP_NAME=Evali
ARG VITE_APP_ENV=production

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Establecer variables de entorno para el build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_ENV=${VITE_APP_ENV}

# Construir la aplicación (usar build-only para evitar problemas con type-check)
RUN npm run build-only

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
