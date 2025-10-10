# ----------------------------------------------------
# Build stage — using Yarn 4 with Node 20
# ----------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY .yarn .yarn
COPY .yarnrc.yml ./
RUN corepack enable && yarn install --immutable
COPY . .
RUN yarn build

# ----------------------------------------------------
# Production stage — Nginx
# ----------------------------------------------------
FROM nginx:1.28.0-alpine3.21

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
