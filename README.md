# 고니 자료 OX 퀴즈

`C:\Users\wizju\Downloads\고니`의 DOCX 5개, PPTX 2개, PDF 2개에서 추출한 내용을 원문 위치와 연결해 반복 학습하는 정적 OX 퀴즈입니다.

## 포함 범위

- 원문 텍스트 단위 1,939개 색인
- 내용 단위 493개 중복 제거
- OX 문항 860개: 원문 일치 493개, 핵심 용어·연도·수치·순서를 바꾼 변형 367개
- 파일별 필터, 검색, 미학습·오답·북마크 서랍
- 브라우저 학습 기록 저장, JSON 백업·복원

문항의 정답은 외부 사실 검증 결과가 아니라 제공 자료의 원문 기준입니다. 원문 전체는 `source-text.txt`, 범위 수치는 `coverage.json`에서 확인할 수 있습니다.

## 로컬 실행

`fetch()`로 JSON을 읽으므로 파일을 직접 더블클릭하기보다 정적 HTTP 서버로 실행합니다.

```powershell
cd C:\Users\wizju\Documents\Codex\2026-10-22\new-chat\outputs\goni-ox-quiz
python -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)을 엽니다.

## GitHub Pages

이 폴더의 파일을 GitHub 저장소 루트에 올린 뒤, 저장소의 Settings → Pages에서 `Deploy from a branch`, `main`, `/ (root)`를 선택하면 됩니다. GitHub Pages는 공개 웹사이트이므로 문항·원문 근거도 방문자에게 공개됩니다.

학습 기록은 서버에 저장되지 않고 현재 브라우저의 localStorage에만 남습니다. 다른 기기에서 이어갈 때는 `기록 저장`과 `기록 불러오기`를 사용합니다.
