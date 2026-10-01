import React from 'react';
import { FileSpreadsheet, FileText, Edit2, Trash2, CheckSquare, Square } from 'lucide-react';
import { CourseEvaluation } from '../types/evaluation';
import { exportToCsv, exportToExcel } from '../utils/excelExport';

interface SpreadsheetTableViewProps {
  evaluations: CourseEvaluation[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (item: CourseEvaluation) => void;
  onDelete: (id: string) => void;
}

export const SpreadsheetTableView: React.FC<SpreadsheetTableViewProps> = ({
  evaluations,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
}) => {
  const allSelected =
    evaluations.length > 0 && evaluations.every((ev) => selectedIds.has(ev.id));

  const selectedList = evaluations.filter((ev) => selectedIds.has(ev.id));
  const exportTargetList = selectedList.length > 0 ? selectedList : evaluations;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Spreadsheet Action Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-[#0284C7]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>전체 선택</span>
          </button>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            총 <strong className="text-slate-900">{evaluations.length}</strong>행 중{' '}
            <strong className="text-[#0284C7]">{selectedList.length}</strong>행 선택됨
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCsv(exportTargetList)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>
              {selectedList.length > 0
                ? `선택 항목 CSV 저장 (${selectedList.length}건)`
                : '전체 CSV 저장 (.csv)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => exportToExcel(exportTargetList)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-md transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>
              {selectedList.length > 0
                ? `선택 항목 엑셀 저장 (${selectedList.length}건)`
                : '현재 시트 엑셀 저장 (.xlsx)'}
            </span>
          </button>
        </div>
      </div>

      {/* High-Density Spreadsheet Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-2.5 px-3 w-10 text-center">선택</th>
              <th className="py-2.5 px-3 w-12 text-right tabular-nums">No.</th>
              <th className="py-2.5 px-3 whitespace-nowrap">수강학기</th>
              <th className="py-2.5 px-3 whitespace-nowrap">이수구분</th>
              <th className="py-2.5 px-3 whitespace-nowrap">강의명</th>
              <th className="py-2.5 px-3 whitespace-nowrap">교수명</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">학점</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">종합평점</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">강의력</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">과제부담</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">시험난이도</th>
              <th className="py-2.5 px-3 whitespace-nowrap">학점부여</th>
              <th className="py-2.5 px-3 whitespace-nowrap">팀플유무</th>
              <th className="py-2.5 px-3 min-w-[260px]">강의평가 요약 및 본문</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {evaluations.map((item, idx) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-[#0284C7]/[0.05]' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-400 align-middle">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 tabular-nums align-middle">
                    {item.semester}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700 align-middle">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap align-middle">
                    <div>{item.courseName}</div>
                    <div className="text-[11px] font-normal text-slate-400">{item.department}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap align-middle">
                    {item.professorName}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-600 align-middle">
                    {item.credits}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-[#0284C7] align-middle">
                    {item.overallRating.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-700 align-middle">
                    {item.clarityRating}/5
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-700 align-middle">
                    {item.workloadRating}/5
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-700 align-middle">
                    {item.difficultyRating}/5
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 align-middle">
                    {item.gradingGenerosity}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 align-middle">
                    {item.teamProject}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 align-middle max-w-md">
                    <div className="font-semibold text-slate-800 truncate">
                      {item.oneLineSummary}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {item.reviewContent}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap align-middle">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
