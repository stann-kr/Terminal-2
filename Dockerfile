# syntax=docker/dockerfile:1
FROM node:20-alpine

# Apple Silicon에서 네이티브 의존성 빌드를 위한 필수 패키지 설치
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1

# 의존성 설치 최적화
COPY package.json package-lock.json* ./
# 볼륨 마운트 시 발생할 수 있는 이슈 방지를 위해, 
# docker-compose에서 별도 처리하기도 하지만 기본 설치를 진행합니다.
RUN npm install

# Copy application source
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 터미널용 개발 쉘 (dev 모드 구동)
CMD ["npm", "run", "dev"]
