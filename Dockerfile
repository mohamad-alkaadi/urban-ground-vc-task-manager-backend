# --- STAGE 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files to leverage Docker's caching mechanism
COPY package*.json ./

# Install all dependencies (including devDependencies needed for compilation)
RUN npm install

# Copy the rest of your application source code
COPY . .

# Compile TypeScript to JavaScript (generates the /dist folder)
RUN npm run build

# Remove development dependencies to keep the final image minimal
RUN npm prune --production


# --- STAGE 2: Production Run Stage ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy only the necessary runtime files from the builder stage
COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expose the internal port your Express server listens to
EXPOSE 5000

# Start the production application
CMD ["npm", "start"]