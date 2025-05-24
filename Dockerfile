# Use Node.js 18 Alpine image for smaller size
FROM node:18-alpine

# Install necessary build tools for native dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY subscription-manager/backend/package*.json ./subscription-manager/backend/

# Install dependencies
WORKDIR /app/subscription-manager/backend
RUN npm ci --production=false

# Copy the rest of the application
WORKDIR /app
COPY . .

# Generate Prisma client
WORKDIR /app/subscription-manager/backend
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]