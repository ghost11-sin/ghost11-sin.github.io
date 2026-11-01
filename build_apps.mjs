// 저장소의 HTML 파일들을 찾아서 허브가 읽는 앱 목록(apps.json)을 만든다.
//
// 각 도구 파일의 <head> 안에 아래처럼 적으면 목록에 반영된다. (모두 선택 사항)
//
//     <title>월급 배분기</title>                         허브에 보이는 이름
//     <meta name="description" content="월급을 나눠 봐요">  설명 (아이콘을 길게 누르면 보임)
//     <meta name="icon" content="🧮">                    아이콘 (없으면 이름의 첫 글자)
//     <meta name="category" content="돈">                분류 (같은 분류는 같은 색)
//
// - 이름이 _ 또는 . 로 시작하는 파일과 폴더는 목록에서 빠진다. (숨기고 싶을 때 사용)
// - 실행: node build_apps.mjs

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";

const 기본_분류 = "기타";
const 제외_폴더 = new Set([".git", ".github", "node_modules", "icons"]);
const 색 = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#f97316", "#a855f7", "#84cc16", "#ef4444", "#64748b"];

async function 페이지_찾기(폴더 = ".") {
  const 결과 = [];
  for (const 항목 of await readdir(폴더, { withFileTypes: true })) {
    if (제외_폴더.has(항목.name) || /^[._]/.test(항목.name)) continue;
    const 경로 = 폴더 === "." ? 항목.name : posix.join(폴더, 항목.name);
    if (항목.isDirectory()) 결과.push(...(await 페이지_찾기(경로)));
    else if (항목.name.endsWith(".html") && 경로 !== "index.html") 결과.push(경로);
  }
  return 결과;
}

function 풀기(글) {
  return 글.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[e]);
}

// <meta name="이름" content="..."> 의 content 값. 없으면 빈 문자열
function 메타_읽기(글, 이름) {
  for (const 태그 of 글.match(/<meta\b[^>]*>/gis) || []) {
    if (new RegExp(`name\\s*=\\s*["']${이름}["']`, "i").test(태그)) {
      const 내용 = 태그.match(/content\s*=\s*["']([\s\S]*?)["']/i);
      return 내용 ? 풀기(내용[1]).trim() : "";
    }
  }
  return "";
}

async function 정보_읽기(경로) {
  const 글 = await readFile(경로, "utf8");
  const 제목_일치 = 글.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let 제목 = 제목_일치 ? 풀기(제목_일치[1]).trim() : "";
  const 파일 = posix.basename(경로);
  if (!제목) {
    const 이름 = 파일 === "index.html" ? posix.basename(posix.dirname(경로)) : 파일.replace(/\.html$/, "");
    제목 = 이름.replace(/[_-]/g, " ");
  }
  const 주소 = 파일 === "index.html" ? encodeURI(posix.dirname(경로)) + "/" : encodeURI(경로);
  return {
    name: 제목,
    url: 주소,
    icon: 메타_읽기(글, "icon"),
    category: 메타_읽기(글, "category") || 기본_분류,
    description: 메타_읽기(글, "description"),
  };
}

const 도구들 = await Promise.all((await 페이지_찾기()).map(정보_읽기));

// 분류 이름순, 같은 분류 안에서는 제목순. 기본 분류('기타')는 맨 뒤
도구들.sort((a, b) =>
  (a.category === 기본_분류) - (b.category === 기본_분류) ||
  a.category.localeCompare(b.category, "ko") ||
  a.name.localeCompare(b.name, "ko"));

const 분류들 = [...new Set(도구들.map((d) => d.category))];
for (const d of 도구들) d.color = 색[분류들.indexOf(d.category) % 색.length];

await writeFile(join(".", "apps.json"), JSON.stringify(도구들, null, 2) + "\n", "utf8");
console.log(`앱 목록에 ${도구들.length}개 도구를 넣었어요.`);
