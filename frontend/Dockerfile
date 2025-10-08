# ----------------------------------------------------
# Build stage — using Yarn 4 with Node 20
# ----------------------------------------------------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy only Yarn and package files first (for better caching)
COPY package.json yarn.lock ./
COPY .yarn .yarn
COPY .yarnrc.yml ./

# Install dependencies with Yarn
RUN corepack enable && yarn install --immutable

# Copy the rest of the project
COPY . .

# Build the project (Vite build)
RUN yarn build

# ----------------------------------------------------
# Production stage — Nginx
# ----------------------------------------------------
FROM nginx:1.28.0-alpine3.21

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
