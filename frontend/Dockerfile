# Dockerfile for Frontend (Local Development / Docker Compose)
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source and build
COPY . ./
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# Production stage with nginx (Hardened & Secure non-root user setup)
FROM nginx:alpine AS frontend-prod

# Configure permissions for non-root nginx execution
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

COPY --chown=nginx:nginx --from=frontend-builder /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Verify safe runtime environment
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]