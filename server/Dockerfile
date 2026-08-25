# Built from the repo root (docker-compose.yml: context ., dockerfile
# server/Dockerfile) because the API imports ../../shared/limits.json.
FROM node:26-alpine
WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY shared /app/shared
COPY server .
RUN mkdir -p /data
ENV DB_PATH=/data/8wt.db PORT=3000
EXPOSE 3000
CMD ["node", "src/index.ts"]
