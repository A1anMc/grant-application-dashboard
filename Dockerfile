# Multi-stage build for Grant IQ Pro Edition
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY sge-grant-dashboard/package*.json ./
RUN npm ci --only=production
COPY sge-grant-dashboard/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

# Install Python for PDF processing
RUN apk add --no-cache python3 py3-pip

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY . .

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./public

# Create uploads directory
RUN mkdir -p uploads

# Install Python dependencies for PDF processing
COPY services/pdfProcessor/requirements.txt ./services/pdfProcessor/
RUN pip3 install -r services/pdfProcessor/requirements.txt

# Expose ports
EXPOSE 3000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"] 