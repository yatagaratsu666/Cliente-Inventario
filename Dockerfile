FROM node:18

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Exponer el puerto
EXPOSE 1882

# Ejecutar el JS compilado
CMD ["node", "build/scr/Product.js"]