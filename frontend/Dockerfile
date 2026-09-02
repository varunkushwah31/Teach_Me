# Dockerfile for Frontend (Local Development / Docker Compose)
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Install dependencies first (better caching)
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source and build
COPY frontend/ ./
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# Production stage with nginx
FROM nginx:alpine AS frontend-prod

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]