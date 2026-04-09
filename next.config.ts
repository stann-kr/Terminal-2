import type { NextConfig } from "next";

// D1 바인딩은 Docker dev 환경에서 동작하지 않음 (workerd ARM64 호환성 문제)
// API 라우트는 배포 환경(Cloudflare Workers) 또는 cf:preview에서만 정상 동작

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
