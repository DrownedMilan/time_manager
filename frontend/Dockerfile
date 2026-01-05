# ----------------------------------------------------
# Development build — Yarn 4 + Node 20
# ----------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

# Copy package files and Yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies (--immutable is Yarn 4's equivalent of --frozen-lockfile)
RUN yarn install --immutable

# Copy the rest of the frontend
COPY . .

# Start the Vite dev server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
