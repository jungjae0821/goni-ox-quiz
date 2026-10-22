# 고니 개념 OX 퀴즈

`C:\Users\wizju\Downloads\고니`의 DOCX 5개, PPTX 2개, PDF 2개에서 핵심 개념을 선별해 원문 위치와 연결한 정적 OX 퀴즈입니다.

## 포함 범위

- 원문 텍스트 단위 1,939개 색인
- 개념 144개 선별
- OX 문항 288개: 개념마다 O 1개와 X 1개
- 문항마다 개념명, 해설, 원문 근거, 파일·페이지/슬라이드 위치 연결
- 파일별 필터, 검색, 미학습·오답·북마크 서랍
- 브라우저 학습 기록 저장, JSON 백업·복원

문항의 정답은 외부 사실 검증 결과가 아니라 제공 자료의 원문 기준입니다. 문항에는 제목·수업 시간표·발표자 노트·표 잔여물을 넣지 않았습니다. 원문 전체는 `source-text.txt`, 큐레이션 범위와 파일별 문항 수는 `coverage.json`에서 확인할 수 있습니다.

## 로컬 실행

`fetch()`로 JSON을 읽으므로 파일을 직접 더블클릭하기보다 정적 HTTP 서버로 실행합니다.

```powershell
cd C:\Users\wizju\Desktop\goni-ox-quiz
python -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)을 엽니다.

## GitHub Pages

이 폴더의 파일을 GitHub 저장소 루트에 올린 뒤, 저장소의 Settings → Pages에서 `Deploy from a branch`, `main`, `/ (root)`를 선택하면 됩니다. GitHub Pages는 공개 웹사이트이므로 문항·원문 근거도 방문자에게 공개됩니다.

학습 기록은 서버에 저장되지 않고 현재 브라우저의 localStorage에만 남습니다. 다른 기기에서 이어갈 때는 `기록 저장`과 `기록 불러오기`를 사용합니다.
