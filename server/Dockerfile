FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY . .
RUN mkdir -p /data
ENV DB_PATH=/data/8wt.db PORT=3000
EXPOSE 3000
CMD ["node", "src/index.ts"]
