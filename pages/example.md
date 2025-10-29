---
title: "GitHub Pages 정적 블로그 구축하기"
date: 2025-01-26
tags: ["GitHub", "JavaScript", "Web", "Blog"]
category: "Development"
description: "GitHub Pages를 활용하여 마크다운 기반의 정적 블로그를 구축하는 방법을 알아봅니다."
---

# GitHub Pages 정적 블로그 구축하기

GitHub Pages를 활용하면 무료로 정적 웹사이트를 호스팅할 수 있습니다. 이번 글에서는 마크다운 기반의 블로그를 구축하는 방법을 단계별로 설명하겠습니다.

## 🎯 프로젝트 개요

이 프로젝트의 주요 특징은 다음과 같습니다:

- **무료 호스팅**: GitHub Pages 활용
- **마크다운 지원**: 간편한 글 작성
- **다크/라이트 모드**: 사용자 경험 향상
- **검색 기능**: 클라이언트 사이드 검색
- **댓글 시스템**: Giscus 통합

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링과 CSS 변수
- **Vanilla JavaScript**: 프레임워크 없는 순수 JS
- **Marked.js**: 마크다운 파싱
- **Prism.js**: 코드 하이라이팅
- **Giscus**: GitHub Discussions 기반 댓글

## 📁 디렉토리 구조

```
/
├── .nojekyll          # Jekyll 비활성화
├── index.html         # 메인 페이지
├── post.html          # 게시글 상세 페이지
├── css/               # 스타일시트
├── js/                # JavaScript 파일
├── pages/              # 마크다운 게시글
└── .github/workflows/  # GitHub Actions
```

## 🚀 주요 기능

### 1. 반응형 디자인

모든 디바이스에서 최적화된 사용자 경험을 제공합니다.

```css
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}
```

### 2. 다크/라이트 모드

CSS 변수를 활용한 테마 시스템:

```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
}
```

### 3. 검색 및 필터링

- 실시간 검색
- 카테고리별 필터링
- 태그 기반 필터링

## 📝 마크다운 작성법

게시글은 다음과 같은 형식으로 작성합니다:

```markdown
---
title: "게시글 제목"
date: 2025-01-26
tags: ["태그1", "태그2"]
category: "카테고리"
description: "게시글 설명"
---

# 제목

내용...
```

## 🔧 GitHub Actions 설정

자동 배포를 위한 워크플로우:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate posts.json
        run: node .github/scripts/generate-posts.js
      - uses: actions/deploy-pages@v4
```

## 💡 팁과 주의사항

1. **`.nojekyll` 파일 필수**: Jekyll을 비활성화하여 정적 파일로 서빙
2. **posts.json 관리**: Git에 커밋하여 배포 시 포함되도록 설정
3. **Giscus 설정**: GitHub Discussions 활성화 후 앱 설치 필요

## 🎉 결론

GitHub Pages를 활용한 정적 블로그는 다음과 같은 장점이 있습니다:

- **비용 효율성**: 무료 호스팅
- **간편한 관리**: Git 기반 버전 관리
- **빠른 로딩**: 정적 파일의 빠른 서빙
- **확장성**: 필요에 따른 기능 추가 가능

이제 여러분만의 블로그를 시작해보세요! 🚀
