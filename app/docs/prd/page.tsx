import { readFile } from "fs/promises";
import { join } from "path";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

/**
 * PRD.md 파일을 읽어서 표시하는 페이지
 *
 * 접근 경로: /docs/prd
 * Vercel 배포 후에도 접근 가능합니다.
 */
export default async function PRDPage() {
  try {
    // 프로젝트 루트 디렉토리 기준으로 docs/PRD.md 파일 읽기
    const filePath = join(process.cwd(), "docs", "PRD.md");
    const fileContent = await readFile(filePath, "utf-8");

    console.log("✅ PRD.md 파일 로드 성공:", {
      path: filePath,
      size: fileContent.length,
      timestamp: new Date().toISOString(),
    });

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">프로젝트 요구사항 정의서 (PRD)</h1>
          <p className="text-gray-600 dark:text-gray-400">
            프로젝트의 기능 요구사항과 스펙을 정리한 문서입니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <MarkdownRenderer content={fileContent} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ PRD.md 파일 로드 실패:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            파일을 불러올 수 없습니다
          </h2>
          <p className="text-red-600 dark:text-red-400">
            PRD.md 파일을 찾을 수 없거나 읽을 수 없습니다.
          </p>
          <p className="text-sm text-red-500 dark:text-red-500 mt-2">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }
}

