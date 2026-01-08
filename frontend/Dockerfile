# ----------------------------------------------------
# Development build — Yarn 4 + Node 20
# ----------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Enable corepack (uses built-in Yarn from Node)
RUN corepack enable

# Copy package files AND yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN yarn install

# Copy the rest of the frontend
COPY . .

# Start the Vite dev server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
