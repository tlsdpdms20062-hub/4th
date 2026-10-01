import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Upload,
  FileDown,
  RotateCcw,
  CheckCircle2,
  ListFilter,
  Archive,
} from 'lucide-react';
import {
  CourseCategory,
  CourseEvaluation,
  INITIAL_EVALUATIONS,
} from './types/evaluation';
import {
  downloadExcelTemplate,
  exportToCsv,
  exportToExcel,
  parseExcelFile,
} from './utils/excelExport';
import {
  downloadStandaloneHtmlFile,
  downloadVercelDeployZip,
} from './utils/standaloneHtmlGenerator';
import { EvaluationForm } from './components/EvaluationForm';
import { EvaluationCardList } from './components/EvaluationCardList';
import { SpreadsheetTableView } from './components/SpreadsheetTableView';
import { AnalyticsSummaryView } from './components/AnalyticsSummaryView';
import { StandaloneHtmlView } from './components/StandaloneHtmlView';

type ActiveTab = 'list' | 'sheet' | 'analytics' | 'html';
type SortOption = 'latest' | 'rating-desc' | 'rating-asc' | 'workload-asc' | 'name-asc';

const STORAGE_KEY = 'academic_course_evaluations_v1';

export default function App() {
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return INITIAL_EVALUATIONS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [editingItem, setEditingItem] = useState<CourseEvaluation | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'전체' | CourseCategory>('전체');
  const [selectedSemester, setSelectedSemester] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
    } catch {
      // Ignore storage error
    }
  }, [evaluations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Filtered and Sorted Evaluations
  const filteredEvaluations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = evaluations.filter((item) => {
      if (selectedCategory !== '전체' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedSemester !== '전체' && item.semester !== selectedSemester) {
        return false;
      }
      if (!q) return true;
      return (
        item.courseName.toLowerCase().includes(q) ||
        item.professorName.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.oneLineSummary.toLowerCase().includes(q) ||
        item.reviewContent.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating-desc') return b.overallRating - a.overallRating;
      if (sortBy === 'rating-asc') return a.overallRating - b.overallRating;
      if (sortBy === 'workload-asc') return a.workloadRating - b.workloadRating;
      if (sortBy === 'name-asc') return a.courseName.localeCompare(b.courseName, 'ko');
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [evaluations, searchQuery, selectedCategory, selectedSemester, sortBy]);

  // Summary Metrics
  const summaryStats = useMemo(() => {
    const total = evaluations.length;
    if (total === 0) {
      return {
        total: 0,
        avgRating: 0,
        avgWorkload: 0,
        generousRatio: 0,
        topCourse: '-',
      };
    }
    const sumRating = evaluations.reduce((acc, cur) => acc + cur.overallRating, 0);
    const sumWorkload = evaluations.reduce((acc, cur) => acc + cur.workloadRating, 0);
    const generousCount = evaluations.filter(
      (e) => e.gradingGenerosity === '매우 후함' || e.gradingGenerosity === '후함'
    ).length;
    const best = [...evaluations].sort((a, b) => b.overallRating - a.overallRating)[0];

    return {
      total,
      avgRating: sumRating / total,
      avgWorkload: sumWorkload / total,
      generousRatio: Math.round((generousCount / total) * 100),
      topCourse: best ? `${best.courseName} (${best.professorName})` : '-',
    };
  }, [evaluations]);

  const availableSemesters = useMemo(() => {
    const set = new Set<string>(['2026-1학기', '2025-2학기', '2025-1학기']);
    evaluations.forEach((e) => set.add(e.semester));
    return ['전체', ...Array.from(set)];
  }, [evaluations]);

  const handleSaveEvaluation = (item: CourseEvaluation, isEdit: boolean) => {
    if (isEdit) {
      setEvaluations((prev) => prev.map((ev) => (ev.id === item.id ? item : ev)));
      setEditingItem(null);
      showToast(`'${item.courseName}' (${item.professorName} 교수) 강의평가가 수정되었습니다.`);
    } else {
      setEvaluations((prev) => [item, ...prev]);
      showToast(`'${item.courseName}' (${item.professorName} 교수) 강의평가가 등록되었습니다.`);
    }
  };

  const handleDeleteEvaluation = (id: string) => {
    const target = evaluations.find((e) => e.id === id);
    setEvaluations((prev) => prev.filter((e) => e.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
    if (target) {
      showToast(`'${target.courseName}' 강의평가가 삭제되었습니다.`);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const allFilteredSelected =
      filteredEvaluations.length > 0 &&
      filteredEvaluations.every((ev) => selectedIds.has(ev.id));

    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvaluations.map((ev) => ev.id)));
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseExcelFile(file);
      if (imported.length === 0) {
        showToast('엑셀 파일에서 유효한 강의명/교수명 데이터를 찾지 못했습니다.');
      } else {
        setEvaluations((prev) => [...imported, ...prev]);
        showToast(`엑셀 파일에서 ${imported.length}건의 강의평가를 성공적으로 불러왔습니다.`);
      }
    } catch {
      showToast('엑셀 파일을 읽는 중 오류가 발생했습니다. 올바른 .xlsx 또는 .csv 파일인지 확인해 주세요.');
    } finally {
      e.target.value = '';
    }
  };

  const handleExportMainExcel = () => {
    const targetList =
      selectedIds.size > 0
        ? evaluations.filter((e) => selectedIds.has(e.id))
        : filteredEvaluations.length > 0
        ? filteredEvaluations
        : evaluations;

    exportToExcel(targetList);
    showToast(
      `총 ${targetList.length}건의 강의평가 및 통계 시트가 엑셀(.xlsx) 파일로 저장되었습니다.`
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('전체');
    setSelectedSemester('전체');
    setSortBy('latest');
  };

  const handleRestoreDefaults = () => {
    setEvaluations(INITIAL_EVALUATIONS);
    setSelectedIds(new Set());
    setEditingItem(null);
    handleResetFilters();
    showToast('기본 샘플 강의평가 5건이 복원되었습니다.');
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Hidden File Input for Excel Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelUpload}
        className="hidden"
      />

      {/* Top Bar Contract: Strictly 3 zones (1: Brand wordmark, 2: 4 Nav Links, 3: 2 Primary Actions) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('list');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            학사 강의평가 아카이브
          </a>

          {/* Zone 2: 4 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'list'
                  ? 'border-[#0284C7] text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              평가 작성 및 목록
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'sheet'
                  ? 'border-[#0284C7] text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              엑셀 시트 뷰
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-[#0284C7] text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              교수·과목 통계
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'html'
                  ? 'border-[#0284C7] text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Vercel 배포 · HTML
            </button>
          </nav>

          {/* Zone 3: 2 primary actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>엑셀 불러오기</span>
            </button>
            <button
              type="button"
              onClick={handleExportMainExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>엑셀로 저장 (.xlsx)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Container (1400px desktop layout) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-7 space-y-6">
        {/* Top Summary Metrics Bar & Excel Utility Controls */}
        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-5 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                강의평가 작성 및 엑셀 데이터 관리
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                교수명, 강의명, 종합평점, 세부 루브릭(강의력·과제·시험·학점) 및 수강평을 기록하고 엑셀(.xlsx, .csv) 또는 단일 HTML 파일로 내보내세요.
              </p>
            </div>

            {/* Secondary Export & Template Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  exportToCsv(filteredEvaluations.length > 0 ? filteredEvaluations : evaluations);
                  showToast('CSV 파일(UTF-8 BOM 한글 깨짐 방지 적용)이 다운로드되었습니다.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV 저장 (.csv)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadExcelTemplate();
                  showToast('업로드용 엑셀 양식(강의평가_업로드_양식.xlsx)이 다운로드되었습니다.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>엑셀 양식 다운로드</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await downloadVercelDeployZip(evaluations);
                  showToast('Vercel 즉시 배포용 패키지(index.html + vercel.json + README.md)가 다운로드되었습니다.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
              >
                <Archive className="w-3.5 h-3.5 text-sky-400" />
                <span>Vercel 배포용 ZIP 다운로드</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadStandaloneHtmlFile(evaluations);
                  showToast('단독 실행 가능한 index.html 파일이 다운로드되었습니다.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>index.html 저장</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                title="초기 샘플 데이터 5건으로 복원"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>샘플 복원</span>
              </button>
            </div>
          </div>

          {/* 4-Column Tabular Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="pr-4 lg:border-r lg:border-slate-200">
              <div className="text-xs text-slate-500">총 등록된 강의평가</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {summaryStats.total}
                </span>
                <span className="text-xs text-slate-500">건 (현재 필터: {filteredEvaluations.length}건)</span>
              </div>
            </div>

            <div className="pr-4 lg:border-r lg:border-slate-200">
              <div className="text-xs text-slate-500">전체 평균 평점</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-bold text-[#0284C7]">
                  ★ {summaryStats.avgRating.toFixed(2)}
                </span>
                <span className="font-mono-tabular text-xs text-slate-400">/ 5.00</span>
              </div>
            </div>

            <div className="pr-4 lg:border-r lg:border-slate-200">
              <div className="text-xs text-slate-500">평균 과제 부담도 · 학점 후함 비율</div>
              <div className="mt-1 flex items-baseline gap-2 font-mono-tabular">
                <span className="text-2xl font-bold text-slate-900">
                  {summaryStats.avgWorkload.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">
                  / 5.0 · 학점 후함 {summaryStats.generousRatio}%
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">최고 평점 추천 강의</div>
              <div className="mt-1 text-sm font-bold text-slate-900 truncate">
                {summaryStats.topCourse}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                엑셀 저장 시 3개 시트(목록·교수통계·구분통계) 자동 생성
              </div>
            </div>
          </div>
        </section>

        {/* Two-Zone Workspace Layout: Left = Evaluation Composer, Right = Data Views */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Course Evaluation Form (5 cols on lg) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
            <EvaluationForm
              editingItem={editingItem}
              onSave={handleSaveEvaluation}
              onCancelEdit={() => setEditingItem(null)}
            />
          </div>

          {/* Right Column: Filter Bar + Active View (7 cols on lg, 8 cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* View Mode Segmented Switcher & Search/Filter Controls */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Interactive View Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'list'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    강의평가 카드뷰 ({filteredEvaluations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sheet')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'sheet'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    엑셀 시트 미리보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'analytics'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    교수·과목 통계
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'html'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vercel 배포 · HTML
                  </button>
                </div>

                {/* Semester & Sort Selectors */}
                <div className="flex items-center gap-2">
                  <select
                    aria-label="수강학기 필터"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
                  >
                    {availableSemesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem === '전체' ? '전체 학기' : sem}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="정렬 기준"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="latest">최신 등록순</option>
                    <option value="rating-desc">평점 높은순</option>
                    <option value="rating-asc">평점 낮은순</option>
                    <option value="workload-asc">과제 적은순</option>
                    <option value="name-asc">강의명 가나다순</option>
                  </select>
                </div>
              </div>

              {/* Search Bar & Category Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="강의명, 교수명, 학과 또는 강의평 키워드 검색..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* Category Filter Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  <ListFilter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                  {(['전체', '전공필수', '전공선택', '교양필수', '교양선택', '일선/기타'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Active View Content */}
            {activeTab === 'list' && (
              <EvaluationCardList
                evaluations={filteredEvaluations}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onEdit={(item) => {
                  setEditingItem(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDeleteEvaluation}
                onResetFilters={handleResetFilters}
              />
            )}

            {activeTab === 'sheet' && (
              <SpreadsheetTableView
                evaluations={filteredEvaluations}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onEdit={(item) => {
                  setEditingItem(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDeleteEvaluation}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsSummaryView evaluations={filteredEvaluations} />
            )}

            {activeTab === 'html' && <StandaloneHtmlView evaluations={evaluations} />}
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-5 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>학사 강의평가 아카이브 · 모든 데이터는 브라우저에 자동 보존되며 언제든 엑셀(.xlsx, .csv)로 내보낼 수 있습니다.</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleExportMainExcel}
              className="hover:text-slate-900 underline underline-offset-2"
            >
              전체 엑셀 다운로드 (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => downloadStandaloneHtmlFile(evaluations)}
              className="hover:text-slate-900 underline underline-offset-2"
            >
              단독 HTML 다운로드 (.html)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
