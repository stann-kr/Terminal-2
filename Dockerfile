# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

# 네이티브 의존성 빌드 + workerd(glibc 2.36 필요) 실행을 위한 패키지 설치
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1

# 의존성 설치 최적화
COPY package.json package-lock.json ./
COPY patches ./patches
COPY scripts/verify-use-scramble-patch.mjs ./scripts/verify-use-scramble-patch.mjs
RUN npm ci

# Copy application source
COPY . .

EXPOSE 3005

ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# 터미널용 개발 쉘 (dev 모드 구동)
CMD ["npm", "run", "dev"]
