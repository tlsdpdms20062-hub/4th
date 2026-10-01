import React, { useEffect, useState } from 'react';
import { Star, RotateCcw, Check, Plus, Edit3 } from 'lucide-react';
import {
  AttendanceMethod,
  CourseCategory,
  CourseEvaluation,
  ExamCount,
  GradingGenerosity,
  TeamProjectLevel,
} from '../types/evaluation';
import { formatTodayDate } from '../utils/excelExport';

interface EvaluationFormProps {
  editingItem: CourseEvaluation | null;
  onSave: (evaluation: CourseEvaluation, isEdit: boolean) => void;
  onCancelEdit: () => void;
}

const SEMESTERS = ['2026-2학기', '2026-1학기', '2025-2학기', '2025-1학기', '2024-2학기', '계절학기'];
const CATEGORIES: CourseCategory[] = ['전공필수', '전공선택', '교양필수', '교양선택', '일선/기타'];
const GRADING_OPTIONS: GradingGenerosity[] = ['매우 후함', '후함', '보통', '깐깐함'];
const TEAM_OPTIONS: TeamProjectLevel[] = ['없음', '1회 (소규모)', '학기 프로젝트'];
const ATTENDANCE_OPTIONS: AttendanceMethod[] = ['전자출결', '직접 호명', '랜덤/과제대체', '출석 무관'];
const EXAM_OPTIONS: ExamCount[] = [
  '중간+기말 (2회)',
  '기말만 (1회)',
  '수시 퀴즈+시험',
  '시험 없음 (과제/발표 대체)',
];

function getRatingLabel(score: number): string {
  if (score >= 4.8) return '최고 명강의 (적극 추천)';
  if (score >= 4.0) return '우수 강의 (수강 추천)';
  if (score >= 3.0) return '무난한 강의 (보통)';
  if (score >= 2.0) return '아쉬운 편 (신중 선택)';
  return '비추천 (재고 필요)';
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  editingItem,
  onSave,
  onCancelEdit,
}) => {
  const [courseName, setCourseName] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [semester, setSemester] = useState('2026-1학기');
  const [category, setCategory] = useState<CourseCategory>('전공필수');
  const [department, setDepartment] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [overallRating, setOverallRating] = useState<number>(4.5);
  const [clarityRating, setClarityRating] = useState<number>(5);
  const [workloadRating, setWorkloadRating] = useState<number>(3);
  const [difficultyRating, setDifficultyRating] = useState<number>(3);
  const [gradingGenerosity, setGradingGenerosity] = useState<GradingGenerosity>('후함');
  const [teamProject, setTeamProject] = useState<TeamProjectLevel>('없음');
  const [attendanceMethod, setAttendanceMethod] = useState<AttendanceMethod>('전자출결');
  const [examCount, setExamCount] = useState<ExamCount>('중간+기말 (2회)');
  const [oneLineSummary, setOneLineSummary] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [recommendedFor, setRecommendedFor] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setCourseName(editingItem.courseName);
      setProfessorName(editingItem.professorName);
      setSemester(editingItem.semester);
      setCategory(editingItem.category);
      setDepartment(editingItem.department);
      setCredits(editingItem.credits);
      setOverallRating(editingItem.overallRating);
      setClarityRating(editingItem.clarityRating);
      setWorkloadRating(editingItem.workloadRating);
      setDifficultyRating(editingItem.difficultyRating);
      setGradingGenerosity(editingItem.gradingGenerosity);
      setTeamProject(editingItem.teamProject);
      setAttendanceMethod(editingItem.attendanceMethod);
      setExamCount(editingItem.examCount);
      setOneLineSummary(editingItem.oneLineSummary);
      setReviewContent(editingItem.reviewContent);
      setRecommendedFor(editingItem.recommendedFor);
      setErrorMsg(null);
    }
  }, [editingItem]);

  const resetForm = () => {
    setCourseName('');
    setProfessorName('');
    setSemester('2026-1학기');
    setCategory('전공필수');
    setDepartment('');
    setCredits(3);
    setOverallRating(4.5);
    setClarityRating(5);
    setWorkloadRating(3);
    setDifficultyRating(3);
    setGradingGenerosity('후함');
    setTeamProject('없음');
    setAttendanceMethod('전자출결');
    setExamCount('중간+기말 (2회)');
    setOneLineSummary('');
    setReviewContent('');
    setRecommendedFor('');
    setErrorMsg(null);
    if (editingItem) {
      onCancelEdit();
    }
  };

  const handleInsertTemplate = (snippet: string) => {
    setReviewContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      setErrorMsg('강의명을 입력해 주세요.');
      return;
    }
    if (!professorName.trim()) {
      setErrorMsg('교수명을 입력해 주세요.');
      return;
    }
    if (!reviewContent.trim()) {
      setErrorMsg('상세 강의평가 내용을 입력해 주세요.');
      return;
    }

    const finalSummary =
      oneLineSummary.trim() ||
      reviewContent.trim().split('\n')[0].slice(0, 60);

    const payload: CourseEvaluation = {
      id: editingItem ? editingItem.id : `eval-${Date.now()}`,
      courseName: courseName.trim(),
      professorName: professorName.trim().replace(/\s*교수(님)?$/, ''),
      semester,
      category,
      department: department.trim() || '공통/미지정학부',
      credits,
      overallRating,
      clarityRating,
      workloadRating,
      difficultyRating,
      gradingGenerosity,
      teamProject,
      attendanceMethod,
      examCount,
      oneLineSummary: finalSummary,
      reviewContent: reviewContent.trim(),
      recommendedFor: recommendedFor.trim() || '해당 과목 수강을 고민하는 학생',
      createdAt: editingItem ? editingItem.createdAt : formatTodayDate(),
    };

    onSave(payload, Boolean(editingItem));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);

    if (!editingItem) {
      resetForm();
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            {editingItem ? (
              <>
                <Edit3 className="w-4 h-4 text-[#0284C7]" />
                <span>강의평가 수정</span>
              </>
            ) : (
              <span>새 강의평가 작성</span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            작성된 평가는 즉시 목록에 반영되며 엑셀(.xlsx)로 저장할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors whitespace-nowrap shrink-0"
          title="입력 폼 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{editingItem ? '수정 취소' : '초기화'}</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium"
        >
          ▲ 입력 확인: {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. 강의명 & 교수이름 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="input-course-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              강의명 <span className="text-red-600">*</span>
            </label>
            <input
              id="input-course-name"
              type="text"
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="예: 자료구조 및 알고리즘"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="input-prof-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              교수이름 <span className="text-red-600">*</span>
            </label>
            <input
              id="input-prof-name"
              type="text"
              value={professorName}
              onChange={(e) => {
                setProfessorName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="예: 김태호"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition-colors"
            />
          </div>
        </div>

        {/* 2. 수강학기, 이수구분, 개설학과, 학점 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label htmlFor="select-semester" className="block text-xs font-semibold text-slate-700 mb-1.5">
              수강학기
            </label>
            <select
              id="select-semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            >
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
              이수구분
            </label>
            <select
              id="select-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="input-dept" className="block text-xs font-semibold text-slate-700 mb-1.5">
              개설학과
            </label>
            <input
              id="input-dept"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="예: 컴퓨터공학부"
              className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div>
            <label htmlFor="select-credits" className="block text-xs font-semibold text-slate-700 mb-1.5">
              학점
            </label>
            <select
              id="select-credits"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7] tabular-nums"
            >
              <option value={1}>1학점</option>
              <option value={2}>2학점</option>
              <option value={3}>3학점</option>
              <option value={4}>4학점</option>
            </select>
          </div>
        </div>

        {/* 3. 종합 평점 (별점 버튼 + 슬라이더) */}
        <div className="pt-2 pb-2 border-y border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="range-overall" className="text-xs font-semibold text-slate-800">
              종합 평점 (0.5 ~ 5.0점)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{getRatingLabel(overallRating)}</span>
              <span className="font-mono-tabular text-base font-bold text-[#0284C7]">
                {overallRating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const active = overallRating >= starValue;
                const halfActive = !active && overallRating >= starValue - 0.5;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setOverallRating(starValue)}
                    className="p-1 rounded hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#0284C7]"
                    title={`${starValue}점 선택`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        active
                          ? 'fill-amber-400 text-amber-400'
                          : halfActive
                          ? 'fill-amber-200 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <input
              id="range-overall"
              type="range"
              min={0.5}
              max={5.0}
              step={0.5}
              value={overallRating}
              onChange={(e) => setOverallRating(parseFloat(e.target.value))}
              className="flex-1 accent-[#0284C7] cursor-pointer"
            />
          </div>
        </div>

        {/* 4. 세부 루브릭 슬라이더 (강의력, 과제부담, 시험난이도) */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor="range-clarity" className="font-medium text-slate-700">
                강의력 및 전달력
              </label>
              <span className="font-mono-tabular font-semibold text-slate-900">
                {clarityRating} / 5점
              </span>
            </div>
            <input
              id="range-clarity"
              type="range"
              min={1}
              max={5}
              step={1}
              value={clarityRating}
              onChange={(e) => setClarityRating(Number(e.target.value))}
              className="w-full accent-[#0284C7] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="range-workload" className="font-medium text-slate-700">
                  과제 부담도 (1:적음 ~ 5:많음)
                </label>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {workloadRating} / 5
                </span>
              </div>
              <input
                id="range-workload"
                type="range"
                min={1}
                max={5}
                step={1}
                value={workloadRating}
                onChange={(e) => setWorkloadRating(Number(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="range-difficulty" className="font-medium text-slate-700">
                  시험 난이도 (1:쉬움 ~ 5:어려움)
                </label>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {difficultyRating} / 5
                </span>
              </div>
              <input
                id="range-difficulty"
                type="range"
                min={1}
                max={5}
                step={1}
                value={difficultyRating}
                onChange={(e) => setDifficultyRating(Number(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 5. 학점 비율 / 팀플 유무 / 출석 방식 / 시험 횟수 */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label htmlFor="select-grading" className="block text-xs font-semibold text-slate-700 mb-1">
              학점 부여 비율
            </label>
            <select
              id="select-grading"
              value={gradingGenerosity}
              onChange={(e) => setGradingGenerosity(e.target.value as GradingGenerosity)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            >
              {GRADING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-team" className="block text-xs font-semibold text-slate-700 mb-1">
              팀플 (조별과제) 유무
            </label>
            <select
              id="select-team"
              value={teamProject}
              onChange={(e) => setTeamProject(e.target.value as TeamProjectLevel)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            >
              {TEAM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-attendance" className="block text-xs font-semibold text-slate-700 mb-1">
              출석 체크 방식
            </label>
            <select
              id="select-attendance"
              value={attendanceMethod}
              onChange={(e) => setAttendanceMethod(e.target.value as AttendanceMethod)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            >
              {ATTENDANCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-exam" className="block text-xs font-semibold text-slate-700 mb-1">
              시험 횟수 및 방식
            </label>
            <select
              id="select-exam"
              value={examCount}
              onChange={(e) => setExamCount(e.target.value as ExamCount)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
            >
              {EXAM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6. 한줄 요약 */}
        <div>
          <label htmlFor="input-summary" className="block text-xs font-semibold text-slate-700 mb-1.5">
            한줄 핵심 총평
          </label>
          <input
            id="input-summary"
            type="text"
            value={oneLineSummary}
            onChange={(e) => setOneLineSummary(e.target.value)}
            placeholder="예: 개념 설명이 깔끔하고 과제만 성실히 하면 A+ 가능한 명강의"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        {/* 7. 상세 강의평가 본문 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="textarea-review" className="block text-xs font-semibold text-slate-700">
              상세 강의평가 및 수강 팁 <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleInsertTemplate('[수업 방식] ')}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
              >
                + 수업방식
              </button>
              <button
                type="button"
                onClick={() => handleInsertTemplate('[시험/족보 팁] ')}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
              >
                + 시험팁
              </button>
              <button
                type="button"
                onClick={() => handleInsertTemplate('[과제/학점] ')}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
              >
                + 과제/학점
              </button>
            </div>
          </div>
          <textarea
            id="textarea-review"
            rows={4}
            value={reviewContent}
            onChange={(e) => {
              setReviewContent(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="강의 전달력, 교재 활용 여부, 시험 출제 유형(서술형/객관식), 과제 난이도 등 후배 수강생에게 도움이 될 구체적인 후기를 남겨주세요."
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7] leading-relaxed"
          />
        </div>

        {/* 8. 추천 대상 */}
        <div>
          <label htmlFor="input-recommended" className="block text-xs font-semibold text-slate-700 mb-1.5">
            추천 수강 대상 (선택)
          </label>
          <input
            id="input-recommended"
            type="text"
            value={recommendedFor}
            onChange={(e) => setRecommendedFor(e.target.value)}
            placeholder="예: 팀플 없이 시험과 개인 과제로 깔끔하게 평가받고 싶은 학생"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>강의평가가 저장되었습니다</span>
              </>
            ) : editingItem ? (
              <>
                <Check className="w-4 h-4" />
                <span>강의평가 수정 완료</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>강의평가 등록하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
