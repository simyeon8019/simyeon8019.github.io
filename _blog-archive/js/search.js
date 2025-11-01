// 검색 및 필터링 기능
class SearchManager {
  constructor() {
    this.searchInput = document.getElementById("search-input");
    this.searchClear = document.getElementById("search-clear");
    this.categoryFilter = document.getElementById("category-filter");
    this.tagFilters = document.getElementById("tag-filters");
    this.postsContainer = document.getElementById("posts-container");
    this.noResults = document.getElementById("no-results");

    this.posts = [];
    this.filteredPosts = [];
    this.currentFilters = {
      search: "",
      category: "",
      tags: [],
    };

    this.init();
  }

  async init() {
    try {
      await this.loadPosts();
      this.setupEventListeners();
      this.renderPosts();
      this.populateFilters();
      console.log("✅ 검색 시스템이 초기화되었습니다.");
    } catch (error) {
      console.error("❌ 검색 시스템 초기화 실패:", error);
      this.showError("게시글을 불러오는 중 오류가 발생했습니다.");
    }
  }

  async loadPosts() {
    try {
      const response = await fetch("posts.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.posts = await response.json();
      this.filteredPosts = [...this.posts];
      console.log(`✅ ${this.posts.length}개의 게시글을 로드했습니다.`);
    } catch (error) {
      console.error("❌ 게시글 로드 실패:", error);
      this.posts = [];
      this.filteredPosts = [];
    }
  }

  setupEventListeners() {
    // 검색 입력
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.currentFilters.search = e.target.value.toLowerCase();
        this.filterPosts();
      });
    }

    // 검색 초기화
    if (this.searchClear) {
      this.searchClear.addEventListener("click", () => {
        this.clearSearch();
      });
    }

    // 카테고리 필터
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener("change", (e) => {
        this.currentFilters.category = e.target.value;
        this.filterPosts();
      });
    }

    // 태그 필터 (동적으로 생성되므로 이벤트 위임 사용)
    if (this.tagFilters) {
      this.tagFilters.addEventListener("click", (e) => {
        if (e.target.classList.contains("tag-filter")) {
          this.toggleTagFilter(e.target);
        }
      });
    }
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = "";
    }
    this.currentFilters.search = "";
    this.filterPosts();
  }

  toggleTagFilter(tagElement) {
    const tag = tagElement.textContent;
    const isActive = tagElement.classList.contains("active");

    if (isActive) {
      tagElement.classList.remove("active");
      this.currentFilters.tags = this.currentFilters.tags.filter(
        (t) => t !== tag
      );
    } else {
      tagElement.classList.add("active");
      this.currentFilters.tags.push(tag);
    }

    this.filterPosts();
  }

  filterPosts() {
    this.filteredPosts = this.posts.filter((post) => {
      // 검색어 필터
      const matchesSearch =
        !this.currentFilters.search ||
        post.title.toLowerCase().includes(this.currentFilters.search) ||
        post.excerpt.toLowerCase().includes(this.currentFilters.search) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(this.currentFilters.search)
        );

      // 카테고리 필터
      const matchesCategory =
        !this.currentFilters.category ||
        post.category === this.currentFilters.category;

      // 태그 필터
      const matchesTags =
        this.currentFilters.tags.length === 0 ||
        this.currentFilters.tags.every((tag) => post.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });

    this.renderPosts();
  }

  renderPosts() {
    if (!this.postsContainer) return;

    if (this.filteredPosts.length === 0) {
      this.postsContainer.innerHTML = "";
      if (this.noResults) {
        this.noResults.style.display = "block";
      }
      return;
    }

    if (this.noResults) {
      this.noResults.style.display = "none";
    }

    this.postsContainer.innerHTML = this.filteredPosts
      .map(
        (post) => `
      <article class="post-card" onclick="window.location.href='post.html?file=${encodeURIComponent(
        post.file
      )}'">
        <h2 class="post-title">${this.escapeHtml(post.title)}</h2>
        <div class="post-meta">
          <span class="post-date">${this.formatDate(post.date)}</span>
          ${
            post.category
              ? `<span class="post-category">${this.escapeHtml(
                  post.category
                )}</span>`
              : ""
          }
        </div>
        <p class="post-excerpt">${this.escapeHtml(post.excerpt)}</p>
        ${
          post.tags.length > 0
            ? `
          <div class="post-tags">
            ${post.tags
              .map(
                (tag) => `<span class="post-tag">${this.escapeHtml(tag)}</span>`
              )
              .join("")}
          </div>
        `
            : ""
        }
      </article>
    `
      )
      .join("");
  }

  populateFilters() {
    this.populateCategoryFilter();
    this.populateTagFilters();
  }

  populateCategoryFilter() {
    if (!this.categoryFilter) return;

    const categories = [
      ...new Set(this.posts.map((post) => post.category).filter(Boolean)),
    ];

    // 기존 옵션 제거 (첫 번째 "모든 카테고리" 제외)
    while (this.categoryFilter.children.length > 1) {
      this.categoryFilter.removeChild(this.categoryFilter.lastChild);
    }

    // 카테고리 옵션 추가
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      this.categoryFilter.appendChild(option);
    });
  }

  populateTagFilters() {
    if (!this.tagFilters) return;

    const allTags = this.posts.flatMap((post) => post.tags);
    const uniqueTags = [...new Set(allTags)].sort();

    this.tagFilters.innerHTML = uniqueTags
      .map(
        (tag) => `
      <button class="tag-filter" data-tag="${this.escapeHtml(tag)}">
        ${this.escapeHtml(tag)}
      </button>
    `
      )
      .join("");
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    if (this.postsContainer) {
      this.postsContainer.innerHTML = `
        <div class="no-results">
          <p>❌ ${message}</p>
        </div>
      `;
    }
  }
}

// 페이지 로드 시 검색 매니저 초기화
document.addEventListener("DOMContentLoaded", () => {
  new SearchManager();
});
