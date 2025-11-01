# GitHub Pages 정적 블로그

마크다운 기반의 정적 블로그입니다. GitHub Pages를 활용하여 무료로 호스팅되며, 다크/라이트 모드, 검색 기능, 댓글 시스템을 지원합니다.

## 🚀 주요 기능

- ✅ **마크다운 지원**: 간편한 글 작성
- ✅ **다크/라이트 모드**: 사용자 선호도에 따른 테마 전환
- ✅ **실시간 검색**: 제목, 내용, 태그 기반 검색
- ✅ **태그 및 카테고리 필터링**: 게시글 분류 및 필터링
- ✅ **코드 하이라이팅**: Prism.js 기반 문법 강조
- ✅ **댓글 시스템**: Giscus 기반 GitHub Discussions 연동
- ✅ **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- ✅ **자동 배포**: GitHub Actions를 통한 자동 빌드 및 배포

## 📁 프로젝트 구조

```
/
├── .nojekyll                    # Jekyll 비활성화 (필수!)
├── index.html                   # 메인 페이지 (게시글 목록)
├── post.html                    # 게시글 상세 페이지
├── posts.json                   # 게시글 메타데이터 (자동 생성)
├── css/
│   ├── style.css               # 메인 스타일 (다크/라이트 모드)
│   └── prism.css               # 코드 하이라이팅 테마
├── js/
│   ├── app.js                  # 메인 애플리케이션 로직
│   ├── post-loader.js          # 마크다운 로딩 및 파싱
│   ├── search.js               # 검색 기능
│   └── theme.js                # 다크/라이트 모드 토글
├── pages/                      # 마크다운 게시글 폴더
│   ├── example.md
│   └── javascript-es6.md
└── .github/
    ├── workflows/
    │   └── deploy.yml          # GitHub Pages 배포
    └── scripts/
        └── generate-posts.js   # posts.json 생성 스크립트
```

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링과 CSS 변수
- **Vanilla JavaScript**: 프레임워크 없는 순수 JS
- **Marked.js**: 마크다운 파싱
- **Prism.js**: 코드 하이라이팅
- **Giscus**: GitHub Discussions 기반 댓글
- **GitHub Actions**: 자동 빌드 및 배포

## 🚀 배포 방법

### 1단계: GitHub 저장소 생성

1. GitHub에서 새 저장소 생성
2. 저장소 이름을 `{your-username}.github.io`로 설정
3. 이 프로젝트 파일들을 저장소에 업로드

### 2단계: GitHub Pages 설정

1. 저장소 **Settings** → **Pages** 이동
2. **Source**를 "GitHub Actions"로 설정
3. 저장소 **Settings** → **General** → **Features**에서 **Discussions** 활성화

### 3단계: Giscus 댓글 시스템 설정 (선택사항)

1. **GitHub Discussions 활성화**:

   - 저장소 **Settings** → **General** → **Features**에서 **Discussions** 활성화

2. **Giscus 앱 설치**:

   - https://github.com/apps/giscus 접속하여 앱 설치
   - `simyeon8019.github.io` 저장소 선택

3. **설정 정보 가져오기**:

   - https://giscus.app/ko 접속
   - 저장소: `simyeon8019/simyeon8019.github.io` 입력
   - 설정 옵션:
     - 페이지 ↔️ Discussions 매핑: `pathname` 선택
     - Discussion 카테고리: `General` 선택
     - 테마: `preferred_color_scheme` 선택
   - 생성된 `data-repo-id`와 `data-category-id` 값 복사

4. **블로그에 설정 적용**:
   - `js/post-loader.js` 파일의 `loadGiscus()` 함수에서 다음 값 업데이트:
   ```javascript
   script.setAttribute("data-repo", "simyeon8019/simyeon8019.github.io");
   script.setAttribute("data-repo-id", "YOUR_REPO_ID"); // 복사한 값으로 변경
   script.setAttribute("data-category-id", "YOUR_CATEGORY_ID"); // 복사한 값으로 변경
   ```

### 4단계: 배포

1. 파일을 커밋하고 푸시:

   ```bash
   git add .
   git commit -m "feat: GitHub Pages 블로그 초기 설정"
   git push origin main
   ```

2. GitHub Actions가 자동으로 실행되어 배포됩니다
3. `https://{your-username}.github.io`에서 확인

## 📝 게시글 작성 방법

### 마크다운 파일 형식

`pages/` 폴더에 `.md` 파일을 생성하고 다음 형식으로 작성:

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

### Front Matter 필드

- `title`: 게시글 제목 (필수)
- `date`: 작성 날짜 (YYYY-MM-DD 형식)
- `tags`: 태그 배열 (선택사항)
- `category`: 카테고리 (선택사항)
- `description`: 게시글 설명 (선택사항)

### 게시글 발행

1. `pages/` 폴더에 마크다운 파일 작성
2. Git에 커밋하고 푸시
3. GitHub Actions가 자동으로 `posts.json` 생성 및 배포

## 🎨 커스터마이징

### 색상 테마 변경

`css/style.css` 파일의 CSS 변수를 수정:

```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --accent-color: #007acc;
  /* ... */
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --accent-color: #4dabf7;
  /* ... */
}
```

### 사이트 정보 변경

- `index.html`과 `post.html`의 `<title>` 태그 수정
- `index.html`의 사이트 제목 변경
- 푸터 정보 수정

## ⚠️ 중요 사항

### 1. .nojekyll 파일 필수

**반드시 루트 디렉토리에 `.nojekyll` 빈 파일이 있어야 합니다.** 이 파일이 없으면 Jekyll이 활성화되어 일부 파일이 제대로 서빙되지 않습니다.

### 2. posts.json 관리

`posts.json`은 GitHub Actions가 배포 시점에 자동으로 생성하는 파일입니다. 이 파일을 `.gitignore`에 넣지 말고 Git에 커밋하세요.

### 3. 파일 경로 주의

- 마크다운 파일은 반드시 `pages/` 폴더에 저장
- 이미지 파일은 `images/` 폴더에 저장 (필요시 생성)
- 상대 경로 사용 시 주의

## 🔧 문제 해결

### 게시글이 표시되지 않는 경우

1. `.nojekyll` 파일이 루트에 있는지 확인
2. `posts.json`이 Git에 커밋되었는지 확인
3. GitHub Actions 로그에서 오류 확인

### 댓글이 표시되지 않는 경우

1. GitHub Discussions가 활성화되었는지 확인
2. Giscus 앱이 설치되었는지 확인
3. `js/post-loader.js`의 설정 정보가 올바른지 확인

### 스타일이 적용되지 않는 경우

1. CSS 파일 경로가 올바른지 확인
2. 브라우저 캐시 클리어
3. GitHub Pages 배포 상태 확인

## 📚 참고 자료

- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [Marked.js 문서](https://marked.js.org/)
- [Prism.js 문서](https://prismjs.com/)
- [Giscus 문서](https://github.com/giscus/giscus)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 GitHub Issues를 통해 해주세요.

---

**즐거운 블로깅 되세요! 🎉**
