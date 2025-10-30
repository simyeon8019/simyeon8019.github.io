import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  allowedDevOrigins: ["http://192.168.219.100:3000"], // 본인 PC의 내부 IP:포트
};

export default nextConfig;
