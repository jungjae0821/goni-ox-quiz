const STORAGE_KEY = "goni-ox-quiz-state-v2";
const $ = (id) => document.getElementById(id);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

let questionData = null;
let sourceData = null;
let questions = [];
let sourceMap = new Map();
let state = loadState();
let queue = [];
let cursor = 0;
let currentId = null;
let toastTimer = null;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed && typeof parsed === "object") return {
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      bookmarks: parsed.bookmarks && typeof parsed.bookmarks === "object" ? parsed.bookmarks : {},
      mode: ["all", "unlearned", "wrong", "bookmarked"].includes(parsed.mode) ? parsed.mode : "all",
      sourceId: typeof parsed.sourceId === "string" ? parsed.sourceId : "",
      search: typeof parsed.search === "string" ? parsed.search : "",
      shuffled: Boolean(parsed.shuffled),
    };
  } catch (error) {
    console.warn("학습 기록을 읽지 못했습니다.", error);
  }
  return { answers: {}, bookmarks: {}, mode: "all", sourceId: "", search: "", shuffled: false };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

function normalizeSearch(value) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getRecord(questionId) {
  return state.answers[questionId] || null;
}

function isBookmarked(questionId) {
  return Boolean(state.bookmarks[questionId]);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function matchesFilter(question) {
  const record = getRecord(question.id);
  const sourceMatch = !state.sourceId || question.sourceId === state.sourceId;
  const search = normalizeSearch(state.search);
  const textMatch = !search || [question.statement, question.concept, question.evidence, question.source, question.location, question.topic]
    .join(" ").toLocaleLowerCase("ko-KR").includes(search);
  if (!sourceMatch || !textMatch) return false;
  if (state.mode === "unlearned") return !record;
  if (state.mode === "wrong") return Boolean(record && !record.correct);
  if (state.mode === "bookmarked") return isBookmarked(question.id);
  return true;
}

function currentFilterQuestions() {
  return questions.filter(matchesFilter);
}

function setText(id, text) {
  const element = $(id);
  if (element) element.textContent = text;
}

function showToast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("is-visible"), 2200);
}

function updateQueueTitle() {
  const sourceName = state.sourceId ? sourceMap.get(state.sourceId)?.name || "선택 자료" : "전체 자료";
  const modeName = { all: "전체 문항", unlearned: "미학습", wrong: "오답 다시 보기", bookmarked: "북마크" }[state.mode];
  const title = state.sourceId ? `${modeName} · ${sourceName}` : modeName;
  const descriptions = {
    all: "개념 하나씩 확인하고, 답을 고른 뒤 원문 근거로 복습합니다.",
    unlearned: "아직 답하지 않은 문항만 모아 첫 회독을 마칩니다.",
    wrong: "한 번 틀린 문항을 근거와 함께 다시 확인합니다.",
    bookmarked: "나중에 다시 보고 싶은 문항을 모아둔 서랍입니다.",
  };
  setText("queueTitle", title);
  setText("mobileQueueLabel", title);
  setText("queueDescription", descriptions[state.mode]);
  $$("[data-filter-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filterMode === state.mode);
  });
}

function rebuildQueue({ preserve = true } = {}) {
  const previousId = preserve ? currentId : null;
  const filtered = currentFilterQuestions();
  queue = state.shuffled ? shuffleArray(filtered) : filtered;
  const previousIndex = previousId ? queue.findIndex((question) => question.id === previousId) : -1;
  cursor = previousIndex >= 0 ? previousIndex : 0;
  currentId = queue[cursor]?.id || null;
  updateQueueTitle();
  renderCounts();
  renderQuestion();
}

function renderCounts() {
  const search = normalizeSearch(state.search);
  const sourceFilter = (question) => !state.sourceId || question.sourceId === state.sourceId;
  const searchable = questions.filter((question) => {
    if (!sourceFilter(question)) return false;
    return !search || [question.statement, question.concept, question.evidence, question.source, question.location, question.topic]
      .join(" ").toLocaleLowerCase("ko-KR").includes(search);
  });
  const answered = Object.keys(state.answers).length;
  const correct = Object.values(state.answers).filter((record) => record.correct).length;
  const wrong = searchable.filter((question) => state.answers[question.id] && !state.answers[question.id].correct).length;
  const unlearned = searchable.filter((question) => !state.answers[question.id]).length;
  const bookmarked = searchable.filter((question) => isBookmarked(question.id)).length;
  setText("filterCountAll", searchable.length.toLocaleString("ko-KR"));
  setText("filterCountUnlearned", unlearned.toLocaleString("ko-KR"));
  setText("filterCountWrong", wrong.toLocaleString("ko-KR"));
  setText("filterCountBookmarked", bookmarked.toLocaleString("ko-KR"));
  setText("headerProgress", `${answered.toLocaleString("ko-KR")} / ${questions.length.toLocaleString("ko-KR")}`);
  setText("headerAccuracy", answered ? `정확도 ${Math.round(correct / answered * 100)}%` : "정확도 —");
  setText("queueCount", `${queue.length.toLocaleString("ko-KR")}개 문항 · ${answered.toLocaleString("ko-KR")}개 응답 완료`);
  setText("queueSortState", state.shuffled ? "무작위 순서" : "원래 순서");
  setText("footerCoverage", `자료 ${sourceData?.sourceCount || 0}개 · 문항 ${questions.length.toLocaleString("ko-KR")}개`);
  $("shuffleButton").textContent = state.shuffled ? "원래 순서로" : "무작위 순서";
}

function renderSourceList() {
  const container = $("sourceList");
  container.innerHTML = "";
  sourceData.sources.forEach((source) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "source-button";
    button.dataset.sourceId = source.id;
    button.classList.toggle("is-active", state.sourceId === source.id);
    button.innerHTML = `<span>${escapeHTML(source.name)}</span><strong>${source.questionCount.toLocaleString("ko-KR")}</strong>`;
    button.addEventListener("click", () => {
      state.sourceId = state.sourceId === source.id ? "" : source.id;
      saveState();
      rebuildQueue({ preserve: false });
      closeSidebarOnMobile();
    });
    container.appendChild(button);
  });
}

function renderQuestion() {
  const panel = $("questionPanel");
  if (!currentId) {
    panel.querySelectorAll(":scope > :not(#emptyState)").forEach((element) => { element.hidden = true; });
    $("emptyState").hidden = false;
    setText("queueProgressLabel", "0%");
    $("queueProgressBar").style.width = "0%";
    return;
  }
  const question = questions.find((item) => item.id === currentId);
  if (!question) return;
  $("emptyState").hidden = true;
  panel.querySelectorAll(":scope > :not(#emptyState)").forEach((element) => { element.hidden = false; });
  const record = getRecord(question.id);
  setText("questionNumber", `Q ${String(question.number).padStart(3, "0")}`);
  setText("questionConcept", question.concept || "개념 확인");
  setText("questionTopic", question.topic);
  setText("questionSource", question.source);
  setText("questionLocation", question.location);
  setText("questionStatement", question.statement);
  const bookmarkButton = document.querySelector("[data-action='toggle-bookmark']");
  const bookmarked = isBookmarked(question.id);
  bookmarkButton.setAttribute("aria-pressed", String(bookmarked));
  setText("bookmarkLabel", bookmarked ? "북마크 해제" : "북마크");
  $$("[data-answer]").forEach((button) => {
    const value = button.dataset.answer === "true";
    button.classList.remove("is-selected", "is-correct", "is-wrong");
    button.setAttribute("aria-pressed", "false");
    if (record) {
      if (value === record.userAnswer) button.classList.add("is-selected");
      if (value === question.answer) button.classList.add("is-correct");
      if (value === record.userAnswer && !record.correct) button.classList.add("is-wrong");
      button.setAttribute("aria-pressed", String(value === record.userAnswer));
    }
  });
  const resultPanel = $("resultPanel");
  const evidenceStrip = $("evidenceStrip");
  if (!record) {
    resultPanel.hidden = true;
    resultPanel.classList.remove("is-wrong");
    evidenceStrip.hidden = true;
  } else {
    resultPanel.hidden = false;
    resultPanel.classList.toggle("is-wrong", !record.correct);
    setText("resultLabel", record.correct ? "정답" : "다시 보기");
    const userLabel = record.userAnswer ? "O(맞다)" : "X(아니다)";
    const answerLabel = question.answer ? "O" : "X";
    setText("resultMessage", `${userLabel}를 선택했습니다. 자료 기준 정답은 ${answerLabel}입니다.`);
    evidenceStrip.hidden = false;
    setText("evidenceLocation", `${question.source} · ${question.location}`);
    setText("evidenceKind", question.kind);
    setText("evidenceText", question.evidence);
    setText("registerStatus", record.correct ? "정답 확인" : "오답 근거");
  }
  const queuePercent = queue.length ? Math.round((cursor + (record ? 1 : 0)) / queue.length * 100) : 0;
  setText("queueProgressLabel", `${Math.min(queuePercent, 100)}%`);
  $("queueProgressBar").style.width = `${Math.min(queuePercent, 100)}%`;
  setText("sessionHint", record ? "N 또는 다음 문항을 눌러 계속합니다." : "O / X를 누르면 바로 채점됩니다.");
  renderCounts();
}

function answerCurrent(value) {
  if (!currentId) return;
  const question = questions.find((item) => item.id === currentId);
  if (!question) return;
  const previous = getRecord(question.id);
  state.answers[question.id] = {
    userAnswer: value,
    correct: value === question.answer,
    attempts: (previous?.attempts || 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  saveState();
  renderQuestion();
  showToast(value === question.answer ? "정답입니다. 근거를 확인해 보세요." : "오답입니다. 아래 근거를 먼저 확인해 보세요.");
}

function nextQuestion() {
  if (!queue.length) return;
  cursor = (cursor + 1) % queue.length;
  currentId = queue[cursor].id;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleBookmark() {
  if (!currentId) return;
  if (isBookmarked(currentId)) delete state.bookmarks[currentId];
  else state.bookmarks[currentId] = true;
  saveState();
  renderSourceList();
  renderQuestion();
  showToast(isBookmarked(currentId) ? "북마크에 넣었습니다." : "북마크에서 뺐습니다.");
}

function toggleShuffle() {
  state.shuffled = !state.shuffled;
  saveState();
  rebuildQueue({ preserve: false });
  showToast(state.shuffled ? "문항 순서를 섞었습니다." : "원래 자료 순서로 돌아왔습니다.");
}

function resetRecord() {
  if (!window.confirm("모든 정답·오답·북마크 기록을 지울까요?")) return;
  state.answers = {};
  state.bookmarks = {};
  saveState();
  rebuildQueue();
  showToast("학습 기록을 초기화했습니다.");
}

function exportRecord() {
  const backup = {
    app: "goni-ox-quiz",
    version: 1,
    exportedAt: new Date().toISOString(),
    answers: state.answers,
    bookmarks: state.bookmarks,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `goni-ox-quiz-record-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("학습 기록 파일을 저장했습니다.");
}

function importRecord(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);
      if (backup.app !== "goni-ox-quiz" || typeof backup.answers !== "object" || typeof backup.bookmarks !== "object") {
        throw new Error("지원하지 않는 기록 파일입니다.");
      }
      state.answers = { ...state.answers, ...backup.answers };
      state.bookmarks = { ...state.bookmarks, ...backup.bookmarks };
      saveState();
      renderSourceList();
      rebuildQueue();
      showToast("학습 기록을 불러왔습니다.");
    } catch (error) {
      showToast(error.message || "기록 파일을 읽지 못했습니다.");
    }
  };
  reader.readAsText(file, "utf-8");
}

function openSourceDrawer() {
  $("sourceDrawer").hidden = false;
  renderSourceResults();
  $("sourceSearch").focus();
}

function closeSourceDrawer() {
  $("sourceDrawer").hidden = true;
}

function renderSourceResults() {
  if (!sourceData) return;
  const query = normalizeSearch($("sourceSearch").value);
  const records = [];
  sourceData.sources.forEach((source) => {
    source.items.forEach((item) => {
      const haystack = `${source.name} ${item.location} ${item.text}`.toLocaleLowerCase("ko-KR");
      if (!query || haystack.includes(query)) records.push({ source, item });
    });
  });
  const limited = records.slice(0, 120);
  const container = $("sourceResults");
  if (!limited.length) {
    container.innerHTML = `<div class="drawer-empty">일치하는 원문이 없습니다. 다른 단어로 찾아보세요.</div>`;
    return;
  }
  container.innerHTML = limited.map(({ source, item }) => `
    <article class="source-result">
      <div class="source-result-head"><span>${escapeHTML(source.name)}</span><span>${escapeHTML(item.location)}</span></div>
      <strong>${escapeHTML(item.text.slice(0, 150))}${item.text.length > 150 ? "…" : ""}</strong>
    </article>
  `).join("");
  if (records.length > limited.length) {
    container.insertAdjacentHTML("beforeend", `<div class="drawer-empty">검색 결과 ${records.length.toLocaleString("ko-KR")}개 중 앞 ${limited.length}개를 표시합니다. 더 좁혀 검색해 보세요.</div>`);
  }
}

function closeSidebarOnMobile() {
  $("sidebar").classList.remove("is-open");
}

function bindEvents() {
  $("questionSearch").value = state.search;
  $("questionSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    saveState();
    rebuildQueue({ preserve: false });
  });
  $("sourceSearch").addEventListener("input", renderSourceResults);
  $("importFile").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) importRecord(file);
    event.target.value = "";
  });
  $$('[data-filter-mode]').forEach((button) => button.addEventListener("click", () => {
    state.mode = button.dataset.filterMode;
    saveState();
    rebuildQueue({ preserve: false });
    closeSidebarOnMobile();
  }));
  $$('[data-answer]').forEach((button) => button.addEventListener("click", () => answerCurrent(button.dataset.answer === "true")));
  $$('[data-action]').forEach((button) => button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "toggle-sidebar") $("sidebar").classList.toggle("is-open");
    if (action === "toggle-source-drawer") openSourceDrawer();
    if (action === "close-source-drawer") closeSourceDrawer();
    if (action === "clear-source") { state.sourceId = ""; saveState(); renderSourceList(); rebuildQueue({ preserve: false }); }
    if (action === "next-question") nextQuestion();
    if (action === "next-unlearned") { state.mode = "unlearned"; state.sourceId = ""; saveState(); renderSourceList(); rebuildQueue({ preserve: false }); }
    if (action === "toggle-bookmark") toggleBookmark();
    if (action === "shuffle") toggleShuffle();
    if (action === "reset-record") resetRecord();
    if (action === "export-record") exportRecord();
    if (action === "import-record") $("importFile").click();
  }));
  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select")) return;
    if (event.key.toLowerCase() === "o") answerCurrent(true);
    if (event.key.toLowerCase() === "x") answerCurrent(false);
    if (event.key.toLowerCase() === "n" || event.key === "ArrowRight") {
      if (getRecord(currentId)) nextQuestion();
    }
    if (event.key === "Escape") {
      closeSourceDrawer();
      closeSidebarOnMobile();
    }
  });
}

async function init() {
  try {
    const [questionResponse, sourceResponse] = await Promise.all([fetch("questions.json"), fetch("sources.json")]);
    if (!questionResponse.ok || !sourceResponse.ok) throw new Error("데이터 파일을 찾을 수 없습니다.");
    questionData = await questionResponse.json();
    sourceData = await sourceResponse.json();
    questions = questionData.questions;
    sourceData.sources.forEach((source) => sourceMap.set(source.id, source));
    bindEvents();
    renderSourceList();
    rebuildQueue({ preserve: false });
  } catch (error) {
    $("questionPanel").innerHTML = `<div class="empty-state"><div><strong>퀴즈 데이터를 불러오지 못했습니다.</strong><p>${escapeHTML(error.message)}<br>GitHub Pages 또는 로컬 서버에서 다시 열어 주세요.</p></div></div>`;
    console.error(error);
  }
}

init();
