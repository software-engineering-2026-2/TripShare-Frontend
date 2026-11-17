# Etapa 1: build do React
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_USE_MOCKS=false
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

RUN npm run build

# Etapa 2: servir os arquivos com Nginx
FROM nginx:alpine
ENV API_PROXY_TARGET=http://host.docker.internal:8080
ENV NGINX_ENVSUBST_FILTER=^API_PROXY_TARGET$
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Permite iniciar a imagem também quando o backend está em outro host.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
