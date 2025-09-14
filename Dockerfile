# Build stage Node.js artifacts into container /app/src/node/dist
FROM docker.io/node:18 AS build-node
WORKDIR /app/src/node
COPY ./node/package*.json .
RUN npm install
COPY ./node .
RUN npm run build

# Build stage Hugo static site generator
FROM docker.io/klakegg/hugo:ext-alpine AS build-hugo
WORKDIR /app/src/hugo
COPY ./hugo .
RUN hugo --minify

# Production stage
#FROM nginx:alpine
#RUN rm -rf /usr/share/nginx/html/*
#COPY --from=build-node /app/src/node/dist /usr/share/nginx/html
#COPY --from=build-hugo /app/src/hugo/public /usr/share/nginx/html
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
FROM docker.io/caddy:alpine
COPY --from=build-node /app/src/node/dist /srv
COPY --from=build-hugo /app/src/hugo/public /srv
COPY Caddyfile /etc/caddy/Caddyfile

