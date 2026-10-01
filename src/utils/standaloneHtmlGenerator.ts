import JSZip from 'jszip';
import { CourseEvaluation } from '../types/evaluation';
import { formatTodayDate } from './excelExport';

export function generateStandaloneHtmlSource(evaluations: CourseEvaluation[]): string {
  const serializedData = JSON.stringify(evaluations, null, 2);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>학사 강의평가 아카이브 & 엑셀 매니저</title>
  <meta name="description" content="교수명, 강의명, 평점, 세부 루브릭 및 상세 강의평가를 작성·관리하고 엑셀(.xlsx, .csv)로 저장할 수 있는 웹 애플리케이션" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- SheetJS (xlsx) CDN for real .xlsx file export & import -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <style>
    :root {
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --border: #E2E8F0;
      --text: #0F172A;
      --muted: #64748B;
      --accent: #0284C7;
      --accent-hover: #0369A1;
      --emerald: #059669;
      --emerald-hover: #047857;
      --danger: #DC2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding-bottom: 64px;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
    }
    .header-inner {
      max-width: 1380px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      text-decoration: none;
    }
    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    button, .btn-label {
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    button:hover, .btn-label:hover { background: #F1F5F9; }
    .btn-primary {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-excel {
      background: var(--emerald);
      color: #fff;
      border-color: var(--emerald);
    }
    .btn-excel:hover { background: var(--emerald-hover); }
    .container {
      max-width: 1380px;
      margin: 24px auto;
      padding: 0 20px;
    }
    .summary-bar {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    @media (max-width: 860px) {
      .summary-bar { grid-template-columns: repeat(2, 1fr); }
    }
    .stat-item {
      border-right: 1px solid var(--border);
      padding-right: 16px;
    }
    .stat-item:last-child { border-right: none; }
    .stat-label { font-size: 12px; color: var(--muted); }
    .stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .workspace {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .workspace { grid-template-columns: 1fr; }
    }
    .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 22px;
    }
    .panel-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .form-group { margin-bottom: 13px; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 5px;
    }
    input, select, textarea {
      width: 100%;
      padding: 8px 11px;
      font-size: 13px;
      font-family: inherit;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      background: #fff;
      color: var(--text);
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    .filter-bar {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
    }
    .card-list {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .eval-card {
      padding: 20px 22px;
      border-bottom: 1px solid var(--border);
    }
    .eval-card:last-child { border-bottom: none; }
    .meta-line {
      font-size: 12px;
      color: var(--muted);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 6px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }
    .course-title { font-size: 17px; font-weight: 700; }
    .prof-name { font-size: 14px; font-weight: 600; color: #334155; margin-left: 8px; }
    .rubric-bar {
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      color: #475569;
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .summary-quote { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
    .review-body { font-size: 14px; color: #334155; white-space: pre-line; }
    .btn-sm { padding: 4px 9px; font-size: 11px; }
    .btn-del { color: var(--danger); border-color: #FECACA; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="#" class="brand">학사 강의평가 아카이브</a>
      <div class="actions">
        <label class="btn-label">
          <span>엑셀 불러오기 (.xlsx)</span>
          <input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="importExcel(event)" />
        </label>
        <button type="button" onclick="exportCsv()">CSV 저장 (.csv)</button>
        <button type="button" class="btn-excel" onclick="exportExcel()">엑셀로 저장 (.xlsx)</button>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="summary-bar">
      <div class="stat-item">
        <div class="stat-label">총 등록된 강의평가</div>
        <div class="stat-value mono" id="statTotal">0건</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">전체 평균 평점</div>
        <div class="stat-value mono" style="color: var(--accent);" id="statAvg">★ 0.00</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">평균 과제 부담도</div>
        <div class="stat-value mono" id="statWorkload">0.0 / 5.0</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">최고 평점 강의</div>
        <div class="stat-value" style="font-size: 15px; margin-top: 8px;" id="statBest">-</div>
      </div>
    </section>

    <div class="workspace">
      <section class="panel">
        <div class="panel-title">
          <span id="formHeaderTitle">새 강의평가 작성</span>
          <button type="button" class="btn-sm" onclick="resetForm()">초기화</button>
        </div>
        <form id="evalForm" onsubmit="handleSave(event)">
          <input type="hidden" id="editId" value="" />
          <div class="form-row">
            <div class="form-group">
              <label for="courseName">강의명 *</label>
              <input id="courseName" required placeholder="예: 자료구조 및 알고리즘" />
            </div>
            <div class="form-group">
              <label for="professorName">교수이름 *</label>
              <input id="professorName" required placeholder="예: 김태호" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="semester">수강학기</label>
              <select id="semester">
                <option value="2026-2학기">2026-2학기</option>
                <option value="2026-1학기" selected>2026-1학기</option>
                <option value="2025-2학기">2025-2학기</option>
                <option value="2025-1학기">2025-1학기</option>
                <option value="계절학기">계절학기</option>
              </select>
            </div>
            <div class="form-group">
              <label for="category">이수구분</label>
              <select id="category">
                <option value="전공필수">전공필수</option>
                <option value="전공선택">전공선택</option>
                <option value="교양필수">교양필수</option>
                <option value="교양선택">교양선택</option>
                <option value="일선/기타">일선/기타</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="department">개설학과</label>
              <input id="department" placeholder="예: 컴퓨터공학부" value="컴퓨터공학부" />
            </div>
            <div class="form-group">
              <label for="credits">학점</label>
              <select id="credits">
                <option value="1">1학점</option>
                <option value="2">2학점</option>
                <option value="3" selected>3학점</option>
                <option value="4">4학점</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="overallRating">종합 평점 (0.5 ~ 5.0) *</label>
              <input id="overallRating" type="number" step="0.5" min="0.5" max="5.0" value="4.5" required />
            </div>
            <div class="form-group">
              <label for="clarityRating">강의력 (1 ~ 5)</label>
              <input id="clarityRating" type="number" min="1" max="5" value="5" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="workloadRating">과제 부담 (1:적음 ~ 5:많음)</label>
              <input id="workloadRating" type="number" min="1" max="5" value="3" />
            </div>
            <div class="form-group">
              <label for="difficultyRating">시험 난이도 (1:쉬움 ~ 5:어려움)</label>
              <input id="difficultyRating" type="number" min="1" max="5" value="3" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="gradingGenerosity">학점 부여 비율</label>
              <select id="gradingGenerosity">
                <option value="매우 후함">매우 후함</option>
                <option value="후함" selected>후함</option>
                <option value="보통">보통</option>
                <option value="깐깐함">깐깐함</option>
              </select>
            </div>
            <div class="form-group">
              <label for="teamProject">팀플 유무</label>
              <select id="teamProject">
                <option value="없음">없음</option>
                <option value="1회 (소규모)">1회 (소규모)</option>
                <option value="학기 프로젝트">학기 프로젝트</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="oneLineSummary">한줄 핵심 요약 *</label>
            <input id="oneLineSummary" required placeholder="강의의 핵심 특징을 한 줄로 요약해 주세요" />
          </div>
          <div class="form-group">
            <label for="reviewContent">상세 강의평가 및 수강 팁 *</label>
            <textarea id="reviewContent" rows="4" required placeholder="수업 방식, 과제, 시험 난이도 및 수강 팁을 작성해 주세요"></textarea>
          </div>
          <div class="form-group">
            <label for="recommendedFor">추천 수강 대상</label>
            <input id="recommendedFor" placeholder="예: 팀플 없이 시험으로 평가받고 싶은 학생" />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 11px; font-size: 13px;">
            강의평가 저장하기
          </button>
        </form>
      </section>

      <section>
        <div class="filter-bar">
          <input id="searchInput" type="search" placeholder="강의명, 교수명, 학과, 키워드 검색..." style="max-width: 320px;" oninput="renderApp()" />
          <div style="display:flex; gap:8px;">
            <select id="filterCategory" onchange="renderApp()" style="width:auto;">
              <option value="전체">전체 이수구분</option>
              <option value="전공필수">전공필수</option>
              <option value="전공선택">전공선택</option>
              <option value="교양필수">교양필수</option>
              <option value="교양선택">교양선택</option>
              <option value="일선/기타">일선/기타</option>
            </select>
            <select id="sortSelect" onchange="renderApp()" style="width:auto;">
              <option value="latest">최신 등록순</option>
              <option value="rating-desc">평점 높은순</option>
              <option value="rating-asc">평점 낮은순</option>
            </select>
          </div>
        </div>

        <div class="card-list" id="evalListContainer"></div>
      </section>
    </div>
  </main>

  <script>
    const STORAGE_KEY = 'academic_course_evaluations_v1';
    let evaluations = (function() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return ${serializedData};
    })();

    function saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
      } catch (e) {}
    }

    function getFilteredList() {
      const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
      const cat = document.getElementById('filterCategory').value;
      const sort = document.getElementById('sortSelect').value;

      let list = evaluations.filter(item => {
        if (cat !== '전체' && item.category !== cat) return false;
        if (!q) return true;
        return (
          (item.courseName || '').toLowerCase().includes(q) ||
          (item.professorName || '').toLowerCase().includes(q) ||
          (item.department || '').toLowerCase().includes(q) ||
          (item.oneLineSummary || '').toLowerCase().includes(q) ||
          (item.reviewContent || '').toLowerCase().includes(q)
        );
      });

      list.sort((a, b) => {
        if (sort === 'rating-desc') return b.overallRating - a.overallRating;
        if (sort === 'rating-asc') return a.overallRating - b.overallRating;
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
      return list;
    }

    function renderApp() {
      const total = evaluations.length;
      const avg = total > 0 ? (evaluations.reduce((s, e) => s + Number(e.overallRating), 0) / total).toFixed(2) : '0.00';
      const work = total > 0 ? (evaluations.reduce((s, e) => s + Number(e.workloadRating), 0) / total).toFixed(1) : '0.0';
      const best = total > 0 ? [...evaluations].sort((a, b) => b.overallRating - a.overallRating)[0] : null;

      document.getElementById('statTotal').textContent = total + '건';
      document.getElementById('statAvg').textContent = '★ ' + avg;
      document.getElementById('statWorkload').textContent = work + ' / 5.0';
      document.getElementById('statBest').textContent = best ? (best.courseName + ' (' + best.professorName + ' 교수)') : '-';

      const list = getFilteredList();
      const container = document.getElementById('evalListContainer');

      if (list.length === 0) {
        container.innerHTML = '<div style="padding:48px; text-align:center; color:#64748B;">조건에 맞는 강의평가가 없습니다.</div>';
        return;
      }

      container.innerHTML = list.map(item => \`
        <article class="eval-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
            <div class="meta-line">
              <span>\${item.semester}</span> ·
              <strong style="color:#334155;">\${item.category}</strong> ·
              <span>\${item.department}</span> ·
              <span>\${item.credits || 3}학점</span> ·
              <span>작성일 \${item.createdAt}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-sm" onclick="editItem('\${item.id}')">수정</button>
              <button type="button" class="btn-sm btn-del" onclick="removeItem('\${item.id}')">삭제</button>
            </div>
          </div>
          <div class="card-header">
            <div>
              <span class="course-title">\${item.courseName}</span>
              <span class="prof-name">\${item.professorName} 교수</span>
            </div>
            <div class="mono" style="font-size:16px; font-weight:700; color:var(--accent);">
              ★ \${Number(item.overallRating).toFixed(1)} <span style="font-size:12px; color:#94A3B8;">/ 5.0</span>
            </div>
          </div>
          <div class="rubric-bar mono">
            <span>강의력 <strong>\${item.clarityRating || 5}/5</strong></span> /
            <span>과제부담 <strong>\${item.workloadRating}/5</strong></span> /
            <span>시험난이도 <strong>\${item.difficultyRating}/5</strong></span> /
            <span>학점부여 <strong>\${item.gradingGenerosity}</strong></span> /
            <span>팀플 <strong>\${item.teamProject || '없음'}</strong></span>
          </div>
          <div class="summary-quote">“\${item.oneLineSummary}”</div>
          <div class="review-body">\${item.reviewContent}</div>
        </article>
      \`).join('');
    }

    function resetForm() {
      document.getElementById('evalForm').reset();
      document.getElementById('editId').value = '';
      document.getElementById('overallRating').value = '4.5';
      document.getElementById('formHeaderTitle').textContent = '새 강의평가 작성';
    }

    function editItem(id) {
      const target = evaluations.find(e => e.id === id);
      if (!target) return;
      document.getElementById('editId').value = target.id;
      document.getElementById('courseName').value = target.courseName;
      document.getElementById('professorName').value = target.professorName;
      document.getElementById('semester').value = target.semester;
      document.getElementById('category').value = target.category;
      document.getElementById('department').value = target.department;
      document.getElementById('credits').value = String(target.credits || 3);
      document.getElementById('overallRating').value = target.overallRating;
      document.getElementById('clarityRating').value = target.clarityRating || 5;
      document.getElementById('workloadRating').value = target.workloadRating;
      document.getElementById('difficultyRating').value = target.difficultyRating;
      document.getElementById('gradingGenerosity').value = target.gradingGenerosity;
      document.getElementById('teamProject').value = target.teamProject || '없음';
      document.getElementById('oneLineSummary').value = target.oneLineSummary;
      document.getElementById('reviewContent').value = target.reviewContent;
      document.getElementById('recommendedFor').value = target.recommendedFor || '';
      document.getElementById('formHeaderTitle').textContent = '강의평가 수정';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleSave(e) {
      e.preventDefault();
      const editId = document.getElementById('editId').value;
      const newItem = {
        id: editId || ('ev-' + Date.now()),
        courseName: document.getElementById('courseName').value.trim(),
        professorName: document.getElementById('professorName').value.trim(),
        semester: document.getElementById('semester').value,
        category: document.getElementById('category').value,
        department: document.getElementById('department').value.trim() || '공통학부',
        credits: parseInt(document.getElementById('credits').value, 10) || 3,
        overallRating: parseFloat(document.getElementById('overallRating').value) || 4.5,
        clarityRating: parseInt(document.getElementById('clarityRating').value, 10) || 5,
        workloadRating: parseInt(document.getElementById('workloadRating').value, 10) || 3,
        difficultyRating: parseInt(document.getElementById('difficultyRating').value, 10) || 3,
        gradingGenerosity: document.getElementById('gradingGenerosity').value,
        teamProject: document.getElementById('teamProject').value,
        attendanceMethod: '전자출결',
        examCount: '중간+기말 (2회)',
        oneLineSummary: document.getElementById('oneLineSummary').value.trim(),
        reviewContent: document.getElementById('reviewContent').value.trim(),
        recommendedFor: document.getElementById('recommendedFor').value.trim() || '수강 희망 학생',
        createdAt: new Date().toISOString().slice(0, 10)
      };

      if (editId) {
        evaluations = evaluations.map(ev => ev.id === editId ? newItem : ev);
      } else {
        evaluations.unshift(newItem);
      }
      saveToStorage();
      resetForm();
      renderApp();
    }

    function removeItem(id) {
      evaluations = evaluations.filter(ev => ev.id !== id);
      saveToStorage();
      renderApp();
    }

    function exportExcel() {
      const list = getFilteredList();
      const rows = list.map((item, i) => ({
        '연번': i + 1,
        '수강학기': item.semester,
        '이수구분': item.category,
        '개설학과': item.department,
        '강의명': item.courseName,
        '교수명': item.professorName,
        '학점': item.credits || 3,
        '종합평점(5.0)': item.overallRating,
        '강의력(5)': item.clarityRating || 5,
        '과제부담도(5)': item.workloadRating,
        '시험난이도(5)': item.difficultyRating,
        '학점부여': item.gradingGenerosity,
        '팀플유무': item.teamProject || '없음',
        '한줄요약': item.oneLineSummary,
        '상세강의평가': item.reviewContent,
        '추천대상': item.recommendedFor || '',
        '작성일': item.createdAt
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        {wch:6},{wch:12},{wch:10},{wch:15},{wch:24},{wch:12},{wch:7},{wch:12},
        {wch:10},{wch:12},{wch:12},{wch:12},{wch:14},{wch:35},{wch:55},{wch:28},{wch:12}
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '강의평가_목록');
      XLSX.writeFile(wb, '강의평가_데이터_' + new Date().toISOString().slice(0,10) + '.xlsx');
    }

    function exportCsv() {
      const list = getFilteredList();
      const headers = ['연번','수강학기','이수구분','개설학과','강의명','교수명','학점','종합평점','강의력','과제부담도','시험난이도','학점부여','팀플유무','한줄요약','상세강의평가','추천대상','작성일'];
      const rows = list.map((item, i) => [
        i + 1, item.semester, item.category, item.department, item.courseName, item.professorName,
        item.credits || 3, item.overallRating, item.clarityRating || 5, item.workloadRating, item.difficultyRating,
        item.gradingGenerosity, item.teamProject || '없음', item.oneLineSummary, item.reviewContent, item.recommendedFor || '', item.createdAt
      ].map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','));
      const csv = '\\uFEFF' + [headers.join(','), ...rows].join('\\r\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '강의평가_목록_' + new Date().toISOString().slice(0,10) + '.csv';
      a.click();
    }

    function importExcel(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        rows.forEach((r, idx) => {
          const cName = String(r['강의명'] || r['과목명'] || '').trim();
          const pName = String(r['교수명'] || r['교수이름'] || '').trim();
          if (!cName && !pName) return;
          evaluations.unshift({
            id: 'imp-' + Date.now() + '-' + idx,
            courseName: cName || '미지정 강의',
            professorName: pName || '미지정 교수',
            semester: String(r['수강학기'] || '2026-1학기'),
            category: String(r['이수구분'] || '전공선택'),
            department: String(r['개설학과'] || '공통학부'),
            credits: Number(r['학점'] || 3),
            overallRating: Number(r['종합평점(5.0)'] || r['종합평점'] || 4.5),
            clarityRating: Number(r['강의력(5)'] || r['강의력'] || 5),
            workloadRating: Number(r['과제부담도(5)'] || r['과제부담'] || 3),
            difficultyRating: Number(r['시험난이도(5)'] || r['시험난이도'] || 3),
            gradingGenerosity: String(r['학점부여'] || '후함'),
            teamProject: String(r['팀플유무'] || '없음'),
            attendanceMethod: '전자출결',
            examCount: '중간+기말 (2회)',
            oneLineSummary: String(r['한줄요약'] || (cName + ' 수강평')),
            reviewContent: String(r['상세강의평가'] || r['강의평가'] || ''),
            recommendedFor: String(r['추천대상'] || ''),
            createdAt: String(r['작성일'] || new Date().toISOString().slice(0,10))
          });
        });
        saveToStorage();
        renderApp();
        event.target.value = '';
      };
      reader.readAsArrayBuffer(file);
    }

    renderApp();
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(evaluations: CourseEvaluation[]): void {
  const html = generateStandaloneHtmlSource(evaluations);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadVercelDeployZip(evaluations: CourseEvaluation[]): Promise<void> {
  const zip = new JSZip();

  // 1. Complete self-contained index.html
  const htmlSource = generateStandaloneHtmlSource(evaluations);
  zip.file('index.html', htmlSource);

  // 2. vercel.json configured for zero-config static deployment
  const vercelJson = JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      version: 2,
      cleanUrls: true,
      rewrites: [
        {
          source: '/(.*)',
          destination: '/index.html',
        },
      ],
    },
    null,
    2
  );
  zip.file('vercel.json', vercelJson);

  // 3. README.md with Vercel deployment instructions
  const readmeMd = `# 학사 강의평가 아카이브 & 엑셀 매니저 (Vercel 배포용 패키지)

교수명, 강의명, 평점, 세부 루브릭 및 강의평가를 작성하고 엑셀(.xlsx, .csv)로 저장 및 불러올 수 있는 웹 애플리케이션입니다.

## Vercel에 바로 올리는 방법 (30초 완성)

### 방법 1: GitHub를 통해 Vercel에 배포하기 (가장 추천)
1. 새로운 GitHub 저장소(Repository)를 만들고 이 압축파일 안의 파일들(\`index.html\`, \`vercel.json\`, \`README.md\`)을 업로드(Push)합니다.
2. [https://vercel.com/new](https://vercel.com/new) 에 접속하여 방금 만든 GitHub 저장소를 **Import** 합니다.
3. 별도 설정 변경 없이 바로 **Deploy** 버튼을 누르면 10초 내에 \`https://프로젝트이름.vercel.app\` 주소가 생성됩니다!

### 방법 2: Vercel CLI로 폴더에서 바로 배포하기
터미널에서 압축을 푼 폴더로 이동한 뒤 아래 명령어를 실행하세요:
\`\`\`bash
npx vercel --prod
\`\`\`
`;
  zip.file('README.md', readmeMd);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vercel-course-evaluation-deploy-${formatTodayDate()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
