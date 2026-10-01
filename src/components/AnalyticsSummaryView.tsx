import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { CourseCategory, CourseEvaluation } from '../types/evaluation';
import { exportToExcel } from '../utils/excelExport';

interface AnalyticsSummaryViewProps {
  evaluations: CourseEvaluation[];
}

export const AnalyticsSummaryView: React.FC<AnalyticsSummaryViewProps> = ({ evaluations }) => {
  const categories: CourseCategory[] = ['전공필수', '전공선택', '교양필수', '교양선택', '일선/기타'];

  const categoryStats = categories.map((cat) => {
    const list = evaluations.filter((e) => e.category === cat);
    const count = list.length;
    const avgOverall =
      count > 0 ? list.reduce((s, e) => s + e.overallRating, 0) / count : 0;
    const avgWorkload =
      count > 0 ? list.reduce((s, e) => s + e.workloadRating, 0) / count : 0;
    const avgDifficulty =
      count > 0 ? list.reduce((s, e) => s + e.difficultyRating, 0) / count : 0;
    return {
      category: cat,
      count,
      avgOverall,
      avgWorkload,
      avgDifficulty,
    };
  });

  // Aggregate by Professor
  const profMap = new Map<
    string,
    {
      professorName: string;
      department: string;
      count: number;
      avgOverall: number;
      avgClarity: number;
      avgWorkload: number;
      avgDifficulty: number;
      courses: string[];
    }
  >();

  evaluations.forEach((ev) => {
    const key = `${ev.professorName}__${ev.department}`;
    const existing = profMap.get(key);
    if (!existing) {
      profMap.set(key, {
        professorName: ev.professorName,
        department: ev.department,
        count: 1,
        avgOverall: ev.overallRating,
        avgClarity: ev.clarityRating,
        avgWorkload: ev.workloadRating,
        avgDifficulty: ev.difficultyRating,
        courses: [ev.courseName],
      });
    } else {
      const nextCount = existing.count + 1;
      existing.avgOverall =
        (existing.avgOverall * existing.count + ev.overallRating) / nextCount;
      existing.avgClarity =
        (existing.avgClarity * existing.count + ev.clarityRating) / nextCount;
      existing.avgWorkload =
        (existing.avgWorkload * existing.count + ev.workloadRating) / nextCount;
      existing.avgDifficulty =
        (existing.avgDifficulty * existing.count + ev.difficultyRating) / nextCount;
      existing.count = nextCount;
      if (!existing.courses.includes(ev.courseName)) {
        existing.courses.push(ev.courseName);
      }
    }
  });

  const professorStats = Array.from(profMap.values()).sort(
    (a, b) => b.avgOverall - a.avgOverall
  );

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              01. 이수구분별 평점 및 학업 부담도 비교
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              엑셀 저장 시 3번째 시트(이수구분별_통계)에 함께 기록되는 요약 지표입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportToExcel(evaluations)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-md transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>통계 포함 엑셀 다운로드 (.xlsx)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">이수구분</th>
                <th className="py-2.5 px-3 text-right">등록 건수</th>
                <th className="py-2.5 px-3 text-right">평균 종합평점</th>
                <th className="py-2.5 px-3 w-48">평점 분포 바</th>
                <th className="py-2.5 px-3 text-right">평균 과제부담 (5점)</th>
                <th className="py-2.5 px-3 text-right">평균 시험난이도 (5점)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryStats.map((row) => (
                <tr key={row.category} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.category}</td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-600">
                    {row.count}건
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#0284C7]">
                    {row.count > 0 ? row.avgOverall.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0284C7] rounded-full transition-all"
                        style={{ width: `${(row.avgOverall / 5) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-700">
                    {row.count > 0 ? row.avgWorkload.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-700">
                    {row.count > 0 ? row.avgDifficulty.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professor Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="pb-4 mb-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            02. 교수별 강의평가 요약 통계
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            교수별 평균 평점, 강의 전달력, 과제 부담도 및 담당 과목 현황입니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">교수명</th>
                <th className="py-2.5 px-3">소속학과</th>
                <th className="py-2.5 px-3">담당 강의</th>
                <th className="py-2.5 px-3 text-right">평가수</th>
                <th className="py-2.5 px-3 text-right">평균 평점</th>
                <th className="py-2.5 px-3 text-right">강의력</th>
                <th className="py-2.5 px-3 text-right">과제부담</th>
                <th className="py-2.5 px-3 text-right">시험난이도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {professorStats.map((prof) => (
                <tr key={`${prof.professorName}-${prof.department}`} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {prof.professorName} 교수
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {prof.department}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {prof.courses.join(', ')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-600">
                    {prof.count}건
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#0284C7]">
                    ★ {prof.avgOverall.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-700">
                    {prof.avgClarity.toFixed(1)} / 5
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-700">
                    {prof.avgWorkload.toFixed(1)} / 5
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-slate-700">
                    {prof.avgDifficulty.toFixed(1)} / 5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
