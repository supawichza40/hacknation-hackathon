# FounderGraph — production container.
# Long-running Node server (better-sqlite3 native addon + on-disk SQLite + runtime
# file reads). NOT for serverless. See HOSTING.md.
#
# Node 26 to match local dev; the full bookworm image ships python3/make/g++ so
# better-sqlite3 compiles from source (per .npmrc) and its ABI matches this Node.
# If the node:26-bookworm tag is unavailable, install Node 26 via NodeSource instead.
FROM node:26-bookworm

ENV NODE_ENV=production
WORKDIR /app

# Install deps first for layer caching. .npmrc forces better-sqlite3 from source.
COPY package.json package-lock.json .npmrc .nvmrc ./
RUN npm ci

# App source + the tracked demo/replay artifacts read at runtime.
COPY . .

# Production build (Next.js). tsc stays the real type gate; see next.config.
RUN npm run build

# The platform provides PORT; default to 3000 for local `docker run`.
ENV PORT=3000
EXPOSE 3000

# Seed the gitignored SQLite DB on boot, then serve. Ephemeral DB = clean state
# per restart (see HOSTING.md for the persistent-volume alternative).
CMD ["sh", "-c", "npm run seed && npm start"]
