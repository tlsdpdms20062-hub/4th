import * as XLSX from 'xlsx';
import {
  AttendanceMethod,
  CourseCategory,
  CourseEvaluation,
  ExamCount,
  GradingGenerosity,
  TeamProjectLevel,
} from '../types/evaluation';

export function formatTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function exportToExcel(evaluations: CourseEvaluation[], customFileName?: string): void {
  const rows = evaluations.map((item, idx) => ({
    '연번': idx + 1,
    '수강학기': item.semester,
    '이수구분': item.category,
    '개설학과': item.department,
    '강의명': item.courseName,
    '교수명': item.professorName,
    '학점': item.credits,
    '종합평점(5.0)': Number(item.overallRating.toFixed(1)),
    '강의력(5)': item.clarityRating,
    '과제부담(5)': item.workloadRating,
    '시험난이도(5)': item.difficultyRating,
    '학점부여': item.gradingGenerosity,
    '팀플유무': item.teamProject,
    '출석방식': item.attendanceMethod,
    '시험방식': item.examCount,
    '한줄요약': item.oneLineSummary,
    '상세강의평가': item.reviewContent,
    '추천대상': item.recommendedFor,
    '작성일': item.createdAt,
  }));

  const workbook = XLSX.utils.book_new();

  // Sheet 1: 강의평가 목록
  const mainSheet = XLSX.utils.json_to_sheet(rows);
  mainSheet['!cols'] = [
    { wch: 6 },  // 연번
    { wch: 13 }, // 수강학기
    { wch: 11 }, // 이수구분
    { wch: 16 }, // 개설학과
    { wch: 26 }, // 강의명
    { wch: 12 }, // 교수명
    { wch: 7 },  // 학점
    { wch: 13 }, // 종합평점
    { wch: 11 }, // 강의력
    { wch: 12 }, // 과제부담
    { wch: 13 }, // 시험난이도
    { wch: 12 }, // 학점부여
    { wch: 15 }, // 팀플유무
    { wch: 14 }, // 출석방식
    { wch: 22 }, // 시험방식
    { wch: 38 }, // 한줄요약
    { wch: 60 }, // 상세강의평가
    { wch: 32 }, // 추천대상
    { wch: 13 }, // 작성일
  ];
  XLSX.utils.book_append_sheet(workbook, mainSheet, '강의평가_목록');

  // Sheet 2: 교수별 요약 통계
  const profMap = new Map<
    string,
    {
      professorName: string;
      department: string;
      count: number;
      sumOverall: number;
      sumClarity: number;
      sumWorkload: number;
      sumDifficulty: number;
      courses: Set<string>;
    }
  >();

  evaluations.forEach((ev) => {
    const key = `${ev.professorName}__${ev.department}`;
    const existing = profMap.get(key) || {
      professorName: ev.professorName,
      department: ev.department,
      count: 0,
      sumOverall: 0,
      sumClarity: 0,
      sumWorkload: 0,
      sumDifficulty: 0,
      courses: new Set<string>(),
    };
    existing.count += 1;
    existing.sumOverall += ev.overallRating;
    existing.sumClarity += ev.clarityRating;
    existing.sumWorkload += ev.workloadRating;
    existing.sumDifficulty += ev.difficultyRating;
    existing.courses.add(ev.courseName);
    profMap.set(key, existing);
  });

  const profRows = Array.from(profMap.values()).map((p, i) => ({
    '순번': i + 1,
    '교수명': p.professorName,
    '소속학과': p.department,
    '등록된 평가수': p.count,
    '평균 종합평점': Number((p.sumOverall / p.count).toFixed(2)),
    '평균 강의력': Number((p.sumClarity / p.count).toFixed(2)),
    '평균 과제부담도': Number((p.sumWorkload / p.count).toFixed(2)),
    '평균 시험난이도': Number((p.sumDifficulty / p.count).toFixed(2)),
    '담당 강의명': Array.from(p.courses).join(', '),
  }));

  const profSheet = XLSX.utils.json_to_sheet(profRows);
  profSheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 15 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(workbook, profSheet, '교수별_요약통계');

  // Sheet 3: 이수구분별 통계
  const categories: CourseCategory[] = ['전공필수', '전공선택', '교양필수', '교양선택', '일선/기타'];
  const catRows = categories
    .map((cat) => {
      const subset = evaluations.filter((e) => e.category === cat);
      if (subset.length === 0) return null;
      const count = subset.length;
      const avgOverall = subset.reduce((s, e) => s + e.overallRating, 0) / count;
      const avgClarity = subset.reduce((s, e) => s + e.clarityRating, 0) / count;
      const avgWorkload = subset.reduce((s, e) => s + e.workloadRating, 0) / count;
      const avgDifficulty = subset.reduce((s, e) => s + e.difficultyRating, 0) / count;
      return {
        '이수구분': cat,
        '평가 건수': count,
        '평균 종합평점': Number(avgOverall.toFixed(2)),
        '평균 강의력': Number(avgClarity.toFixed(2)),
        '평균 과제부담': Number(avgWorkload.toFixed(2)),
        '평균 시험난이도': Number(avgDifficulty.toFixed(2)),
      };
    })
    .filter(Boolean);

  const catSheet = XLSX.utils.json_to_sheet(catRows);
  catSheet['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
    { wch: 15 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(workbook, catSheet, '이수구분별_통계');

  const fileName = customFileName || `강의평가_데이터_${formatTodayDate()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportToCsv(evaluations: CourseEvaluation[], customFileName?: string): void {
  const headers = [
    '연번',
    '수강학기',
    '이수구분',
    '개설학과',
    '강의명',
    '교수명',
    '학점',
    '종합평점',
    '강의력',
    '과제부담',
    '시험난이도',
    '학점부여',
    '팀플유무',
    '출석방식',
    '시험방식',
    '한줄요약',
    '상세강의평가',
    '추천대상',
    '작성일',
  ];

  const escapeCsvCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(','),
    ...evaluations.map((item, idx) =>
      [
        idx + 1,
        item.semester,
        item.category,
        item.department,
        item.courseName,
        item.professorName,
        item.credits,
        item.overallRating.toFixed(1),
        item.clarityRating,
        item.workloadRating,
        item.difficultyRating,
        item.gradingGenerosity,
        item.teamProject,
        item.attendanceMethod,
        item.examCount,
        item.oneLineSummary,
        item.reviewContent,
        item.recommendedFor,
        item.createdAt,
      ]
        .map(escapeCsvCell)
        .join(',')
    ),
  ];

  // UTF-8 BOM (\uFEFF) so Microsoft Excel opens Korean text without broken encoding
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = customFileName || `강의평가_목록_${formatTodayDate()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadExcelTemplate(): void {
  const sampleRows = [
    {
      '수강학기': '2026-1학기',
      '이수구분': '전공필수',
      '개설학과': '컴퓨터공학부',
      '강의명': '운영체제',
      '교수명': '한지훈',
      '학점': 3,
      '종합평점(5.0)': 4.5,
      '강의력(5)': 5,
      '과제부담(5)': 4,
      '시험난이도(5)': 3,
      '학점부여': '후함',
      '팀플유무': '없음',
      '출석방식': '전자출결',
      '시험방식': '중간+기말 (2회)',
      '한줄요약': '커널 실습이 체계적이며 학점 기준이 투명한 강의',
      '상세강의평가': '핀토스 실습 프로젝트 단계별 가이드라인이 잘 되어 있어 혼자서도 충분히 따라갈 수 있습니다.',
      '추천대상': '시스템 프로그래밍 기초를 탄탄히 다지고 싶은 전공생',
      '작성일': formatTodayDate(),
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleRows);
  ws['!cols'] = [
    { wch: 13 },
    { wch: 11 },
    { wch: 16 },
    { wch: 24 },
    { wch: 12 },
    { wch: 7 },
    { wch: 13 },
    { wch: 11 },
    { wch: 12 },
    { wch: 13 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
    { wch: 22 },
    { wch: 36 },
    { wch: 55 },
    { wch: 32 },
    { wch: 13 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, '강의평가_양식');
  XLSX.writeFile(wb, '강의평가_업로드_양식.xlsx');
}

export async function parseExcelFile(file: File): Promise<CourseEvaluation[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const validCategories: CourseCategory[] = ['전공필수', '전공선택', '교양필수', '교양선택', '일선/기타'];
  const validGrading: GradingGenerosity[] = ['매우 후함', '후함', '보통', '깐깐함'];
  const validTeam: TeamProjectLevel[] = ['없음', '1회 (소규모)', '학기 프로젝트'];
  const validAttendance: AttendanceMethod[] = ['전자출결', '직접 호명', '랜덤/과제대체', '출석 무관'];
  const validExam: ExamCount[] = [
    '중간+기말 (2회)',
    '기말만 (1회)',
    '수시 퀴즈+시험',
    '시험 없음 (과제/발표 대체)',
  ];

  const parsed: CourseEvaluation[] = [];

  rawRows.forEach((row, index) => {
    const courseName = String(row['강의명'] || row['과목명'] || row['courseName'] || '').trim();
    const professorName = String(row['교수명'] || row['교수이름'] || row['담당교수'] || row['professorName'] || '').trim();
    if (!courseName && !professorName) return;

    const rawCategory = String(row['이수구분'] || row['category'] || '전공선택').trim() as CourseCategory;
    const category: CourseCategory = validCategories.includes(rawCategory) ? rawCategory : '전공선택';

    const rawOverall = Number(row['종합평점(5.0)'] ?? row['종합평점'] ?? row['평점'] ?? row['overallRating'] ?? 4.0);
    const overallRating = Math.min(5, Math.max(0.5, Number.isFinite(rawOverall) ? rawOverall : 4.0));

    const rawClarity = Number(row['강의력(5)'] ?? row['강의력'] ?? row['clarityRating'] ?? 4);
    const clarityRating = Math.min(5, Math.max(1, Math.round(Number.isFinite(rawClarity) ? rawClarity : 4)));

    const rawWorkload = Number(row['과제부담(5)'] ?? row['과제부담'] ?? row['과제부담도(5점만점)'] ?? row['workloadRating'] ?? 3);
    const workloadRating = Math.min(5, Math.max(1, Math.round(Number.isFinite(rawWorkload) ? rawWorkload : 3)));

    const rawDifficulty = Number(row['시험난이도(5)'] ?? row['시험난이도'] ?? row['시험난이도(5점만점)'] ?? row['difficultyRating'] ?? 3);
    const difficultyRating = Math.min(5, Math.max(1, Math.round(Number.isFinite(rawDifficulty) ? rawDifficulty : 3)));

    const rawGrading = String(row['학점부여'] || row['학점비율'] || '보통').trim() as GradingGenerosity;
    const gradingGenerosity: GradingGenerosity = validGrading.includes(rawGrading) ? rawGrading : '보통';

    const rawTeam = String(row['팀플유무'] || '없음').trim() as TeamProjectLevel;
    const teamProject: TeamProjectLevel = validTeam.includes(rawTeam) ? rawTeam : '없음';

    const rawAttendance = String(row['출석방식'] || '전자출결').trim() as AttendanceMethod;
    const attendanceMethod: AttendanceMethod = validAttendance.includes(rawAttendance) ? rawAttendance : '전자출결';

    const rawExam = String(row['시험방식'] || '중간+기말 (2회)').trim() as ExamCount;
    const examCount: ExamCount = validExam.includes(rawExam) ? rawExam : '중간+기말 (2회)';

    const rawCredits = Number(row['학점'] ?? 3);
    const credits = [1, 2, 3, 4].includes(rawCredits) ? rawCredits : 3;

    parsed.push({
      id: `imported-${Date.now()}-${index}`,
      courseName: courseName || '미지정 강의',
      professorName: professorName || '미지정 교수',
      semester: String(row['수강학기'] || row['학기'] || '2026-1학기').trim(),
      category,
      department: String(row['개설학과'] || row['학과'] || '공통학부').trim(),
      credits,
      overallRating,
      clarityRating,
      workloadRating,
      difficultyRating,
      gradingGenerosity,
      teamProject,
      attendanceMethod,
      examCount,
      oneLineSummary: String(row['한줄요약'] || `${courseName} 수강 후기`).trim(),
      reviewContent: String(row['상세강의평가'] || row['강의평가'] || row['내용'] || '').trim() || '상세 강의평가가 입력되지 않았습니다.',
      recommendedFor: String(row['추천대상'] || '해당 분야에 관심 있는 수강생').trim(),
      createdAt: String(row['작성일'] || formatTodayDate()).trim(),
    });
  });

  return parsed;
}
