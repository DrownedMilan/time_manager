# ----------------------------------------------------
# Development build — Yarn 4 + Node 20
# ----------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Enable corepack (uses built-in Yarn from Node)
RUN corepack enable

# Copy package files (dependencies will be installed in container via entrypoint)
COPY package.json yarn.lock ./

# Copy the rest of the frontend
COPY . .

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# Start the Vite dev server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
