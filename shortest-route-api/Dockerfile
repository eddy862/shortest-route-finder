FROM node:20-bookworm-slim

WORKDIR /app

# Needed for node-gyp native build
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Force sqlite3 to build from source (avoid incompatible prebuilt binary)
ENV npm_config_build_from_source=true
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/delivery.db

EXPOSE 3000

CMD sh -c 'mkdir -p /app/data && if [ ! -f "$DB_PATH" ]; then cp /app/delivery.backup.initial.db "$DB_PATH"; fi && node dist/server.js'