"""저장소의 HTML 파일들을 찾아서 목차 페이지(index.html)를 만든다.

각 도구 파일의 <head> 안에 아래처럼 적으면 목차에 반영된다. (모두 선택 사항)

    <title>월급 배분기</title>                         목차에 보이는 이름
    <meta name="description" content="월급을 나눠 봐요">  이름 아래 설명
    <meta name="icon" content="🧮">                    카드의 아이콘 (없으면 이름의 첫 글자)
    <meta name="category" content="돈">                분류 (없으면 '기타')

- 분류가 두 종류 이상일 때만 분류 제목이 보인다.
- 이름이 _ 또는 . 로 시작하는 파일과 폴더는 목차에서 빠진다. (숨기고 싶을 때 사용)
"""

import html
import pathlib
import re
from urllib.parse import quote

사이트_제목 = "유령의 도구 모음"
기본_분류 = "기타"
제외_폴더 = {".git", ".github", "node_modules"}

템플릿 = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__제목__</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
  :root {
    color-scheme: light;
    --바탕: #ededed;
    --카드: #ffffff;
    --칩: #f1f1f1;
    --글자: #111111;
    --보조: #7b7b7b;
    --그림자: 0 1px 2px rgba(0, 0, 0, 0.04), 0 10px 28px rgba(0, 0, 0, 0.05);
  }
  * { box-sizing: border-box; }
  html { background: var(--바탕); }
  body {
    margin: 0;
    padding: 64px 24px 80px;
    color: var(--글자);
    font-family: "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 720px; margin: 0 auto; }
  header { margin-bottom: 40px; }
  h1 { margin: 0; font-size: 34px; font-weight: 700; letter-spacing: -0.025em; }
  .개수 { margin: 6px 0 0; font-size: 15px; color: var(--보조); }
  section + section { margin-top: 36px; }
  h2 { margin: 0 0 14px; font-size: 15px; font-weight: 700; }
  ul { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  li { display: flex; }
  a {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: var(--카드);
    border-radius: 18px;
    box-shadow: var(--그림자);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.18s, color 0.18s;
  }
  .아이콘 {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--칩);
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    transition: background-color 0.18s;
  }
  .이름 { display: block; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
  .설명 { display: block; margin-top: 4px; font-size: 14px; color: var(--보조); transition: color 0.18s; }
  a:hover, a:focus-visible { background: var(--글자); color: #fff; }
  a:hover .아이콘, a:focus-visible .아이콘 { background: #2b2b2b; }
  a:hover .설명, a:focus-visible .설명 { color: #b8b8b8; }
  a:focus-visible { outline: 2px solid var(--글자); outline-offset: 3px; }
  .비어있음 { color: var(--보조); }
  @media (max-width: 560px) {
    body { padding: 40px 16px 64px; }
    ul { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    a, .아이콘, .설명 { transition: none; }
  }
</style>
</head>
<body>
<main>
<header>
<h1>__제목__</h1>
__개수__
</header>
__본문__
</main>
</body>
</html>
"""


def 페이지_찾기():
    결과 = []
    for 경로 in pathlib.Path(".").rglob("*.html"):
        상대 = 경로.relative_to(".")
        if 상대.as_posix() == "index.html":
            continue
        if any(
            부분 in 제외_폴더 or 부분.startswith((".", "_"))
            for 부분 in 상대.parts
        ):
            continue
        결과.append(상대)
    return 결과


def 메타_읽기(글, 이름):
    """<meta name="이름" content="..."> 의 content 값을 돌려준다. 없으면 빈 문자열."""
    for 태그 in re.findall(r"<meta\b[^>]*>", 글, re.I | re.S):
        if re.search(rf"""name\s*=\s*["']{이름}["']""", 태그, re.I):
            내용 = re.search(r"""content\s*=\s*["'](.*?)["']""", 태그, re.I | re.S)
            if 내용:
                return html.unescape(내용.group(1)).strip()
            break
    return ""


def 정보_읽기(상대):
    글 = 상대.read_text(encoding="utf-8", errors="ignore")

    제목_일치 = re.search(r"<title[^>]*>(.*?)</title>", 글, re.I | re.S)
    제목 = html.unescape(제목_일치.group(1)).strip() if 제목_일치 else ""
    if not 제목:
        이름 = 상대.parent.name if 상대.name == "index.html" else 상대.stem
        제목 = 이름.replace("_", " ").replace("-", " ")

    if 상대.name == "index.html":
        주소 = quote(상대.parent.as_posix()) + "/"
    else:
        주소 = quote(상대.as_posix())

    return {
        "제목": 제목,
        "설명": 메타_읽기(글, "description"),
        "아이콘": 메타_읽기(글, "icon") or 제목[:1],
        "분류": 메타_읽기(글, "category") or 기본_분류,
        "주소": 주소,
    }


def 카드_만들기(도구):
    설명 = f'<span class="설명">{html.escape(도구["설명"])}</span>' if 도구["설명"] else ""
    return (
        f'<li><a href="{html.escape(도구["주소"], quote=True)}">'
        f'<span class="아이콘" aria-hidden="true">{html.escape(도구["아이콘"])}</span>'
        f'<span><span class="이름">{html.escape(도구["제목"])}</span>{설명}</span>'
        f"</a></li>"
    )


def 본문_만들기(도구들):
    if not 도구들:
        return '<p class="비어있음">아직 올린 도구가 없어요. HTML 파일을 저장소에 올리면 여기에 나타나요.</p>'

    묶음 = {}
    for 도구 in 도구들:
        묶음.setdefault(도구["분류"], []).append(도구)

    # 분류 이름순으로 늘어놓고, 기본 분류('기타')는 맨 뒤로 보낸다.
    순서 = sorted(묶음, key=lambda 이름: (이름 == 기본_분류, 이름.casefold()))
    제목_보이기 = len(순서) >= 2

    구역들 = []
    for 이름 in 순서:
        카드들 = "\n".join(카드_만들기(도구) for 도구 in 묶음[이름])
        제목줄 = f"<h2>{html.escape(이름)}</h2>\n" if 제목_보이기 else ""
        구역들.append(f"<section>\n{제목줄}<ul>\n{카드들}\n</ul>\n</section>")
    return "\n".join(구역들)


def main():
    도구들 = sorted(
        (정보_읽기(상대) for 상대 in 페이지_찾기()),
        key=lambda 도구: 도구["제목"].casefold(),
    )
    개수 = f'<p class="개수">{len(도구들)}개의 도구</p>' if 도구들 else ""
    결과 = (
        템플릿.replace("__제목__", html.escape(사이트_제목))
        .replace("__개수__", 개수)
        .replace("__본문__", 본문_만들기(도구들))
    )
    pathlib.Path("index.html").write_text(결과, encoding="utf-8")
    print(f"목차에 {len(도구들)}개 도구를 넣었어요.")


if __name__ == "__main__":
    main()
