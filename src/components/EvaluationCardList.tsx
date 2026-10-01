import React from 'react';
import { Star, Edit2, Trash2, Download, RotateCcw } from 'lucide-react';
import { CourseEvaluation } from '../types/evaluation';
import { exportToExcel } from '../utils/excelExport';

interface EvaluationCardListProps {
  evaluations: CourseEvaluation[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (item: CourseEvaluation) => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
}

export const EvaluationCardList: React.FC<EvaluationCardListProps> = ({
  evaluations,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onResetFilters,
}) => {
  if (evaluations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <p className="text-base font-semibold text-slate-900 mb-1">
          조건에 일치하는 강의평가가 없습니다
        </p>
        <p className="text-sm text-slate-500 mb-5">
          검색어나 필터를 초기화하거나 좌측 작성 폼에서 새로운 강의평가를 등록해 보세요.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>검색 및 필터 전체 초기화</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
      {evaluations.map((item) => {
        const isSelected = selectedIds.has(item.id);
        return (
          <article
            key={item.id}
            className={`p-6 transition-colors ${
              isSelected ? 'bg-[#0284C7]/[0.03]' : 'hover:bg-slate-50/60'
            }`}
          >
            {/* Top Kicker: Unboxed metadata with typographic separators (Zero-Pill Rule) */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                  <span>{item.semester}</span>
                </label>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700">{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>{item.department}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{item.credits}학점</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">작성일 {item.createdAt}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    exportToExcel([item], `강의평가_${item.courseName}_${item.professorName}.xlsx`)
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors whitespace-nowrap"
                  title="이 강의평가만 엑셀로 저장"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>단건 엑셀</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-[#0284C7] hover:bg-slate-100 rounded transition-colors whitespace-nowrap"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>수정</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제</span>
                </button>
              </div>
            </div>

            {/* Course Title, Professor & Overall Rating */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {item.courseName}
                </h3>
                <span className="text-sm font-semibold text-slate-700">
                  {item.professorName} 교수
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        item.overallRating >= s
                          ? 'fill-amber-400 text-amber-400'
                          : item.overallRating >= s - 0.5
                          ? 'fill-amber-200 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono-tabular text-base font-bold text-slate-900">
                  {item.overallRating.toFixed(1)}
                </span>
                <span className="font-mono-tabular text-xs text-slate-400">/ 5.0</span>
              </div>
            </div>

            {/* Rubric Metrics Line (Unboxed text with typographic separators) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 py-2.5 px-3.5 mb-3.5 bg-slate-50 border border-slate-200/80 rounded-md text-xs text-slate-600 tabular-nums">
              <span>
                강의력 <strong className="text-slate-900 font-semibold">{item.clarityRating}/5</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>
                과제부담 <strong className="text-slate-900 font-semibold">{item.workloadRating}/5</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>
                시험난이도 <strong className="text-slate-900 font-semibold">{item.difficultyRating}/5</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>
                학점부여 <strong className="text-slate-900 font-semibold">{item.gradingGenerosity}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>
                팀플 <strong className="text-slate-900 font-semibold">{item.teamProject}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>
                출석 <strong className="text-slate-900 font-semibold">{item.attendanceMethod}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>
                시험 <strong className="text-slate-900 font-semibold">{item.examCount}</strong>
              </span>
            </div>

            {/* One-line Summary & Detailed Review Content */}
            <p className="text-sm font-semibold text-slate-900 mb-1.5">
              “{item.oneLineSummary}”
            </p>
            <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line max-w-[75ch]">
              {item.reviewContent}
            </p>

            {/* Footer Metadata */}
            {item.recommendedFor && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">추천 수강 대상</span>
                <span aria-hidden="true">·</span>
                <span>{item.recommendedFor}</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
