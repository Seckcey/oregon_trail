FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm rebuild esbuild
COPY . .
# Public, build-time: where the API lives (empty = no network), the Turnstile
# site key, the GA4 measurement id. docker-compose.yml sets them.
ARG VITE_8WT_API=
ARG VITE_TURNSTILE_SITE_KEY=
ARG VITE_GA4_ID=
ENV VITE_8WT_API=$VITE_8WT_API
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
ENV VITE_GA4_ID=$VITE_GA4_ID
RUN npm run build

FROM nginx:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
