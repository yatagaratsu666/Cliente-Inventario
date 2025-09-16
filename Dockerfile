# Etapa 1: Build de Angular
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Borrar config por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build de Angular
COPY --from=build /app/dist/frontend-inv/browser /usr/share/nginx/html

# Copiar config personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]