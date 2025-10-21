FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY test-supabase.js .

# Run the test
CMD ["node", "test-supabase.js"]
