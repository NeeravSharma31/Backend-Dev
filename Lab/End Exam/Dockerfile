# Use official lightweight Node.js 20 LTS Alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Set environment variables: Port 3000, listen 0.0.0.0, storage mapped to /app/data
ENV PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data \
    NODE_ENV=production

# Copy dependency definition files
COPY package*.json ./

# Install application dependencies
RUN npm ci --only=production || npm install --production

# Copy application source code
COPY . .

# Create the internal volume mount directory
RUN mkdir -p /app/data

# Expose application port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
