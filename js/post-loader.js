// 게시글 로더 및 Giscus 댓글 시스템
class PostLoader {
  constructor() {
    this.postContent = document.getElementById("post-content");
    this.postTitle = document.getElementById("post-title");
    this.giscusComments = document.getElementById("giscus-comments");

    this.init();
  }

  async init() {
    try {
      const postFile = this.getPostFileFromURL();
      if (!postFile) {
        this.showError("게시글 파일을 찾을 수 없습니다.");
        return;
      }

      await this.loadPost(postFile);
      this.loadGiscus();
      console.log("✅ 게시글이 성공적으로 로드되었습니다.");
    } catch (error) {
      console.error("❌ 게시글 로드 실패:", error);
      this.showError("게시글을 불러오는 중 오류가 발생했습니다.");
    }
  }

  getPostFileFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("file");
  }

  async loadPost(filename) {
    try {
      const response = await fetch(`pages/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const markdownContent = await response.text();
      const { metadata, content } = this.parseMarkdown(markdownContent);

      this.renderPost(metadata, content);
      this.updatePageTitle(metadata.title);

      console.log(`✅ 게시글 "${metadata.title}" 로드 완료`);
    } catch (error) {
      console.error("❌ 게시글 파일 로드 실패:", error);
      throw error;
    }
  }

  parseMarkdown(content) {
    // Front Matter 파싱
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let metadata = {};
    let postContent = content;

    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      postContent = frontMatterMatch[2];

      // Front Matter 라인 파싱
      const lines = frontMatter.split("\n");
      lines.forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // 따옴표 제거
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          // 배열 파싱 (tags)
          if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
            try {
              value = JSON.parse(value);
            } catch {
              value = value
                .slice(1, -1)
                .split(",")
                .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""));
            }
          }

          metadata[key] = value;
        }
      });
    }

    return { metadata, content: postContent };
  }

  renderPost(metadata, content) {
    if (!this.postContent) return;

    // 마크다운을 HTML로 변환
    const htmlContent = this.convertMarkdownToHtml(content);

    // 게시글 헤더 생성
    const postHeader = this.createPostHeader(metadata);

    // 최종 HTML 구성
    this.postContent.innerHTML = `
      ${postHeader}
      <div class="post-body">
        ${htmlContent}
      </div>
    `;

    // 코드 하이라이팅 적용
    this.highlightCode();
  }

  createPostHeader(metadata) {
    const date = this.formatDate(metadata.date);
    const tags = Array.isArray(metadata.tags) ? metadata.tags : [];

    return `
      <header class="post-header">
        <h1 class="post-title-main">${this.escapeHtml(
          metadata.title || "제목 없음"
        )}</h1>
        <div class="post-meta-main">
          <time class="post-date-main">${date}</time>
          ${
            metadata.category
              ? `<span class="post-category-main">${this.escapeHtml(
                  metadata.category
                )}</span>`
              : ""
          }
        </div>
        ${
          tags.length > 0
            ? `
          <div class="post-tags-main">
            ${tags
              .map(
                (tag) =>
                  `<span class="post-tag-main">${this.escapeHtml(tag)}</span>`
              )
              .join("")}
          </div>
        `
            : ""
        }
        ${
          metadata.description
            ? `<p class="post-description">${this.escapeHtml(
                metadata.description
              )}</p>`
            : ""
        }
      </header>
    `;
  }

  convertMarkdownToHtml(markdown) {
    // marked.js 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false,
    });

    return marked.parse(markdown);
  }

  highlightCode() {
    // Prism.js로 코드 하이라이팅 적용
    if (window.Prism) {
      Prism.highlightAll();
    }
  }

  updatePageTitle(title) {
    if (this.postTitle && title) {
      this.postTitle.textContent = `${title} - 블로그`;
    }
    document.title = `${title} - 블로그`;
  }

  loadGiscus() {
    if (!this.giscusComments) return;

    // GitHub Discussions가 활성화되지 않은 경우 안내 메시지 표시
    this.giscusComments.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary);">
        <h4>💬 댓글 시스템</h4>
        <p>댓글 기능을 사용하려면 다음 단계를 따라주세요:</p>
        <ol style="text-align: left; margin: 1rem 0; padding-left: 1.5rem;">
          <li>GitHub 저장소에서 <strong>Discussions</strong> 활성화</li>
          <li><a href="https://giscus.app" target="_blank" style="color: var(--accent-color);">Giscus 앱</a> 설치</li>
          <li>Repository ID와 Category ID 설정</li>
        </ol>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
          <a href="https://github.com/simyeon8019/simyeon8019.github.io/discussions" target="_blank" style="color: var(--accent-color);">
            GitHub Discussions로 이동 →
          </a>
        </p>
      </div>
    `;

    console.log(
      "📝 참고: 실제 사용을 위해 GitHub Discussions를 활성화하고 Giscus 앱을 설치해주세요."
    );
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
    if (this.postContent) {
      this.postContent.innerHTML = `
        <div class="error-message">
          <h2>❌ 오류</h2>
          <p>${message}</p>
          <a href="/" class="back-link">← 목록으로 돌아가기</a>
        </div>
      `;
    }
  }
}

// 페이지 로드 시 포스트 로더 초기화
document.addEventListener("DOMContentLoaded", () => {
  new PostLoader();
});
