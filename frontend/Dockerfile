# Production Dockerfile for frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --prefix frontend

# Copy source code
COPY frontend ./frontend

# Build the application
RUN npm run build --prefix frontend

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
