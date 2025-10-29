// 테마 관리 기능
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.themeIcon = document.querySelector(".theme-icon");
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();

    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  }

  getStoredTheme() {
    return localStorage.getItem("theme");
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.updateIcon(theme);
    localStorage.setItem("theme", theme);
    this.currentTheme = theme;

    console.log(`✅ 테마가 ${theme} 모드로 변경되었습니다.`);
  }

  updateIcon(theme) {
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
  }

  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // 시스템 테마 변경 감지
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });
  }
}

// 페이지 로드 시 테마 매니저 초기화
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});
