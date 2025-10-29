// 메인 애플리케이션 로직
class BlogApp {
  constructor() {
    this.init();
  }

  init() {
    console.log("🚀 블로그 애플리케이션이 시작되었습니다.");
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // 전역 에러 핸들링
    window.addEventListener("error", (event) => {
      console.error("❌ 전역 에러 발생:", event.error);
    });

    // Promise rejection 핸들링
    window.addEventListener("unhandledrejection", (event) => {
      console.error("❌ 처리되지 않은 Promise rejection:", event.reason);
    });
  }
}

// 페이지 로드 시 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new BlogApp();
});
