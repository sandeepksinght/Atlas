FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build && ls -la dist/

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
