export type CourseCategory = '전공필수' | '전공선택' | '교양필수' | '교양선택' | '일선/기타';

export type GradingGenerosity = '매우 후함' | '후함' | '보통' | '깐깐함';

export type TeamProjectLevel = '없음' | '1회 (소규모)' | '학기 프로젝트';

export type AttendanceMethod = '전자출결' | '직접 호명' | '랜덤/과제대체' | '출석 무관';

export type ExamCount = '중간+기말 (2회)' | '기말만 (1회)' | '수시 퀴즈+시험' | '시험 없음 (과제/발표 대체)';

export interface CourseEvaluation {
  id: string;
  courseName: string;         // 강의명
  professorName: string;      // 교수이름
  semester: string;           // 수강학기 (예: 2026-1학기)
  category: CourseCategory;   // 이수구분
  department: string;         // 개설학과
  credits: number;            // 학점 (1, 2, 3)
  overallRating: number;      // 종합평점 (1.0 ~ 5.0, 0.5 단위)
  clarityRating: number;      // 강의력/전달력 (1 ~ 5)
  workloadRating: number;     // 과제 부담도 (1: 매우 적음 ~ 5: 매우 많음)
  difficultyRating: number;   // 시험 난이도 (1: 매우 쉬움 ~ 5: 매우 어려움)
  gradingGenerosity: GradingGenerosity; // 학점 비율/후함 정도
  teamProject: TeamProjectLevel;        // 팀플 유무
  attendanceMethod: AttendanceMethod;   // 출석 체크 방식
  examCount: ExamCount;                 // 시험 횟수/방식
  oneLineSummary: string;     // 한줄 핵심 요약
  reviewContent: string;      // 상세 강의평가 및 수강 팁
  recommendedFor: string;     // 추천 수강 대상
  createdAt: string;          // 작성일 (YYYY-MM-DD)
}

export const INITIAL_EVALUATIONS: CourseEvaluation[] = [
  {
    id: 'eval-101',
    courseName: '자료구조 및 알고리즘',
    professorName: '김태호',
    semester: '2026-1학기',
    category: '전공필수',
    department: '컴퓨터공학부',
    credits: 3,
    overallRating: 4.8,
    clarityRating: 5,
    workloadRating: 4,
    difficultyRating: 3,
    gradingGenerosity: '후함',
    teamProject: '없음',
    attendanceMethod: '전자출결',
    examCount: '중간+기말 (2회)',
    oneLineSummary: '개념 설명이 매우 명확하고 코딩 과제를 통해 실력이 확실히 느는 명강의',
    reviewContent: '트리, 그래프, 해시 테이블 등 핵심 자료구조를 시각 자료와 함께 단계별로 설명해 주셔서 비전공 복수전공자도 따라가기 좋습니다. 격주로 나오는 프로그래밍 과제(총 5회)가 시간이 꽤 걸리지만, 과제만 스스로 해결하면 중간·기말고사는 과제 응용 수준으로 출제되어 고득점이 가능합니다.',
    recommendedFor: '기초 알고리즘 역량과 코딩 테스트 대비를 동시에 잡으려는 학생',
    createdAt: '2026-06-21',
  },
  {
    id: 'eval-102',
    courseName: '거시경제학개론',
    professorName: '이수진',
    semester: '2026-1학기',
    category: '전공선택',
    department: '경제학과',
    credits: 3,
    overallRating: 4.5,
    clarityRating: 5,
    workloadRating: 2,
    difficultyRating: 4,
    gradingGenerosity: '보통',
    teamProject: '없음',
    attendanceMethod: '직접 호명',
    examCount: '중간+기말 (2회)',
    oneLineSummary: '실제 한국은행 통화정책 사례로 IS-LM 모형을 명쾌하게 풀어주시는 강의',
    reviewContent: '수업 시작 전 10분간 최신 금리·물가 뉴스를 경제학 모형과 연결해 설명해 주셔서 지루할 틈이 없습니다. 과제는 학기 중 문제풀이 세트 2번뿐이라 부담이 적으나, 시험은 서술형 그래프 분석 문제가 포함되어 있어 강의안 복습을 꼼꼼히 해야 A학점 이상 받을 수 있습니다.',
    recommendedFor: '팀플 없이 깔끔하게 시험 실력으로 평가받고 싶은 학생',
    createdAt: '2026-06-19',
  },
  {
    id: 'eval-103',
    courseName: '현대사회와 윤리적 딜레마',
    professorName: '박현우',
    semester: '2025-2학기',
    category: '교양필수',
    department: '인문교양학부',
    credits: 2,
    overallRating: 5.0,
    clarityRating: 5,
    workloadRating: 2,
    difficultyRating: 2,
    gradingGenerosity: '매우 후함',
    teamProject: '1회 (소규모)',
    attendanceMethod: '전자출결',
    examCount: '기말만 (1회)',
    oneLineSummary: '학점도 잘 주시고 매주 다루는 토론 주제가 흥미로워 힐링되는 교양 수업',
    reviewContent: '중간고사는 없고 A4 2장 분량의 에세이로 대체됩니다. 학기 후반에 3인 1조로 10분짜리 짧은 사례 발표가 1회 있는데 수업 시간 내에 준비 시간을 주셔서 전혀 부담스럽지 않습니다. 성실하게 출석하고 자신의 논리를 에세이에 담으면 대부분 A0~A+를 주십니다.',
    recommendedFor: '전공 학점 부담이 큰 학기에 교양 학점을 안정적으로 챙기고 싶은 수강생',
    createdAt: '2025-12-22',
  },
  {
    id: 'eval-104',
    courseName: '재무관리와 기업가치평가',
    professorName: '정민석',
    semester: '2025-2학기',
    category: '전공필수',
    department: '경영학부',
    credits: 3,
    overallRating: 3.5,
    clarityRating: 3,
    workloadRating: 5,
    difficultyRating: 5,
    gradingGenerosity: '깐깐함',
    teamProject: '학기 프로젝트',
    attendanceMethod: '직접 호명',
    examCount: '수시 퀴즈+시험',
    oneLineSummary: '배우는 내용은 실무에 정말 유익하지만 과제량과 시험 난이도가 상당히 높음',
    reviewContent: '실제 상장기업 재무제표를 엑셀로 DCF 밸류에이션 해보는 학기 팀 프로젝트가 핵심입니다. 매주 퀴즈가 있고 계산 문제가 까다로워 예습·복습이 필수입니다. 학점 기준은 엄격하시지만 금융권 취업을 준비한다면 남는 것이 가장 많은 수업입니다.',
    recommendedFor: '금융·회계 실무 역량을 깊이 있게 쌓고 싶은 고학년 전공자',
    createdAt: '2025-12-18',
  },
  {
    id: 'eval-105',
    courseName: '데이터 시각화와 통계적 사고',
    professorName: '최유나',
    semester: '2025-1학기',
    category: '교양선택',
    department: '데이터사이언스학과',
    credits: 3,
    overallRating: 4.5,
    clarityRating: 4,
    workloadRating: 3,
    difficultyRating: 2,
    gradingGenerosity: '후함',
    teamProject: '없음',
    attendanceMethod: '전자출결',
    examCount: '시험 없음 (과제/발표 대체)',
    oneLineSummary: '시험 없이 실습 리포트 3회로 평가하며 비전공자도 쉽게 데이터를 다루는 수업',
    reviewContent: '엑셀 피벗 테이블부터 기초 파이썬 차트까지 실습 위주로 진행됩니다. 교수님께서 매 실습 시간마다 돌아다니며 막히는 부분을 1:1로 봐주셔서 초보자도 어렵지 않게 완료할 수 있습니다. 루브릭 기준표가 명확해 기준만 맞추면 만점을 받을 수 있습니다.',
    recommendedFor: '암기형 지필고사보다 실습 과제형 평가를 선호하는 학생',
    createdAt: '2025-06-24',
  },
];
