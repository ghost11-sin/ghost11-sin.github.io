"""저장소의 HTML 파일들을 찾아서 목차 페이지(index.html)를 만든다.

- 각 파일의 <title>이 목차에 표시되는 이름이 된다. 없으면 파일 이름을 쓴다.
- <meta name="description" content="..."> 가 있으면 이름 아래에 설명으로 보인다.
- 이름이 _ 또는 . 로 시작하는 파일과 폴더는 목차에서 빠진다. (숨기고 싶을 때 사용)
"""

import html
import pathlib
import re
from urllib.parse import quote

사이트_제목 = "도구 모음"
제외_폴더 = {".git", ".github", "node_modules"}

템플릿 = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__제목__</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
  :root { --바탕: #000; --글자: #fff; --보조: #a0a0a0; --선: #2e2e2e; }
  * { box-sizing: border-box; }
  html { background: var(--바탕); }
  body {
    margin: 0;
    padding: 56px 24px 72px;
    color: var(--글자);
    font-family: "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 640px; margin: 0 auto; }
  h1 { margin: 0 0 40px; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; }
  ul { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--선); }
  li { border-bottom: 1px solid var(--선); }
  a { display: block; padding: 20px 0; color: inherit; text-decoration: none; }
  .이름 { display: block; font-size: 20px; font-weight: 600; }
  .설명 { display: block; margin-top: 4px; font-size: 15px; color: var(--보조); }
  a:hover .이름 { text-decoration: underline; text-underline-offset: 5px; }
  a:focus-visible { outline: 2px solid var(--글자); outline-offset: 4px; }
  .비어있음 { color: var(--보조); }
</style>
</head>
<body>
<main>
<h1>__제목__</h1>
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


def 정보_읽기(상대):
    글 = 상대.read_text(encoding="utf-8", errors="ignore")

    제목_일치 = re.search(r"<title[^>]*>(.*?)</title>", 글, re.I | re.S)
    제목 = html.unescape(제목_일치.group(1)).strip() if 제목_일치 else ""
    if not 제목:
        이름 = 상대.parent.name if 상대.name == "index.html" else 상대.stem
        제목 = 이름.replace("_", " ").replace("-", " ")

    설명 = ""
    for 태그 in re.findall(r"<meta\b[^>]*>", 글, re.I | re.S):
        if re.search(r"""name\s*=\s*["']description["']""", 태그, re.I):
            내용 = re.search(r"""content\s*=\s*["'](.*?)["']""", 태그, re.I | re.S)
            if 내용:
                설명 = html.unescape(내용.group(1)).strip()
            break

    if 상대.name == "index.html":
        주소 = quote(상대.parent.as_posix()) + "/"
    else:
        주소 = quote(상대.as_posix())

    return 제목, 설명, 주소


def 본문_만들기(페이지들):
    if not 페이지들:
        return '<p class="비어있음">아직 올린 도구가 없어요. HTML 파일을 저장소에 올리면 여기에 나타나요.</p>'

    항목 = []
    for 제목, 설명, 주소 in 페이지들:
        설명_줄 = f'<span class="설명">{html.escape(설명)}</span>' if 설명 else ""
        항목.append(
            f'<li><a href="{html.escape(주소, quote=True)}">'
            f'<span class="이름">{html.escape(제목)}</span>{설명_줄}</a></li>'
        )
    return "<ul>\n" + "\n".join(항목) + "\n</ul>"


def main():
    페이지들 = sorted(
        (정보_읽기(상대) for 상대 in 페이지_찾기()),
        key=lambda 항: 항[0].casefold(),
    )
    결과 = (
        템플릿.replace("__제목__", html.escape(사이트_제목))
        .replace("__본문__", 본문_만들기(페이지들))
    )
    pathlib.Path("index.html").write_text(결과, encoding="utf-8")
    print(f"목차에 {len(페이지들)}개 도구를 넣었어요.")


if __name__ == "__main__":
    main()
