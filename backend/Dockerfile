# Production Dockerfile for backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production --prefix backend

# Copy source code
COPY backend ./backend

# Build the application
RUN npm run build --prefix backend

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./

EXPOSE 3001

CMD ["node", "dist/main.js"]
