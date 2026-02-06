# --------------------
# Build stage
# --------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# --------------------
# Runtime stage
# --------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only required files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Install only production deps
RUN npm install --omit=dev=false

EXPOSE 3000

CMD ["npm", "start"]
