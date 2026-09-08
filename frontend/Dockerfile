# ==============================================================================
# StudyOS Frontend Production Dockerfile (v1.3.1)
# Multi-Stage Build: Node Builder -> Nginx Static Web Server & Reverse Proxy
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:1.25-alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/nginx.conf /usr/share/nginx/html/*

# Copy built artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
