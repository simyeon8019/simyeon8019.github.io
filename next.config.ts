import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // Tavily 검색 결과 이미지 도메인 허용
      // 주의: Tavily 검색 결과는 다양한 외부 도메인을 반환할 수 있으므로
      // 실제 사용 시 검색 결과 도메인을 확인하여 추가 설정 필요
      { hostname: "images.unsplash.com" }, // 일반적으로 많이 사용되는 이미지 호스팅
      { protocol: "https", hostname: "**" }, // 모든 HTTPS 이미지 허용 (개발용, 프로덕션에서는 제한 권장)
    ],
  },
  allowedDevOrigins: ["http://192.168.219.100:3000"], // 본인 PC의 내부 IP:포트
};

export default nextConfig;
