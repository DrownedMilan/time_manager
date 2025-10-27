# ----------------------------------------------------
# Build stage — using Yarn 4 with Node 20
# ----------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./

# Enable corepack and prepare yarn BEFORE copying .yarnrc.yml
RUN corepack enable && corepack prepare yarn@4.10.3 --activate

# Now copy the rest of the application
COPY . .

# Remove .yarnrc.yml to avoid conflicts with corepack's yarn installation
RUN rm -f .yarnrc.yml

# Install dependencies
RUN yarn install --immutable

# For development, use CMD instead of RUN
CMD ["yarn", "dev"]

# ----------------------------------------------------
# Production stage — Nginx
# ----------------------------------------------------
# FROM nginx:1.28.0-alpine3.21

# COPY --from=build /app/dist /usr/share/nginx/html

# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
