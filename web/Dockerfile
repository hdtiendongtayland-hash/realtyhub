# web/Dockerfile
# Lưu ý: KHÔNG dùng node:22-alpine cho Next.js + Tailwind vì:
#   - Alpine dùng musl libc, không có prebuilt cho nhiều native binary:
#     lightningcss-linux-x64-musl, @next/swc-linux-x64-musl ...
#   - npm sẽ fallback build-from-source (rất hay fail trong Docker),
#     hoặc đơn giản là thiếu binary → ứng dụng chạy nhưng Tailwind/Next chậm/lỗi.
# Pattern chuẩn Next.js production: dùng node:22-slim (Debian bookworm, glibc).

FROM node:22-slim AS deps
WORKDIR /app

# Sao chép manifest trước để tận dụng Docker layer cache.
COPY package.json package-lock.json* .npmrc* ./

# `--include=optional` ép npm tải cả optionalDependencies theo platform của image build
# (vd. @next/swc-linux-x64-gnu, lightningcss-linux-x64-gnu). Bỏ qua cờ này là một
# trong những nguyên nhân phổ biến nhất khiến CI/CD Next.js + Tailwind fail.
RUN npm ci --no-audit --no-fund

# ---- Builder ----
FROM node:22-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=https://api.api.dongtayland.click
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- Runner (production) ----
FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=8826

# Tạo user non-root để chạy app
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 8826

CMD ["npm", "start"]
