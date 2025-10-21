FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY test-supabase.js .
COPY server.js .

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
