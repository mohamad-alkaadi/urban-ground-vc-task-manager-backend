# Stage 1: Build the TypeScript code
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run the production app
FROM node:20-alpine

WORKDIR /app

# Only copy the compiled code and production dependencies
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Expose the port your server uses
EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]