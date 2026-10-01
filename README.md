# 학사 강의평가 아카이브 & 엑셀 매니저 (Course Evaluation Ledger)

대학교 강의평가(교수명, 강의명, 수강학기, 이수구분, 종합평점, 세부 루브릭 및 상세 수강평)를 작성·관리하고, **Microsoft Excel(`.xlsx`, `.csv`) 파일로 저장 및 불러오기**할 수 있는 웹 애플리케이션입니다.

---

## 주요 기능

1. **강의평가 작성 및 수정**
   - **기본 정보**: 강의명, 교수명, 수강학기, 이수구분(전공필수·전공선택·교양필수·교양선택·일선), 개설학과, 학점(1~4학점)
   - **종합 평점 및 세부 루브릭**: 종합 평점(0.5~5.0점), 강의력(1~5), 과제 부담도(1~5), 시험 난이도(1~5), 학점 부여 비율(매우 후함~깐깐함), 팀플 유무, 출석 체크 방식, 시험 방식
   - **상세 수강평**: 한줄 핵심 요약, 영역별 작성 템플릿(`+ 수업방식`, `+ 시험팁`, `+ 과제/학점`), 추천 수강 대상
2. **엑셀(`.xlsx` / `.csv`) 저장 및 불러오기**
   - **3개 시트 통합 엑셀 저장 (`.xlsx`)**:
     - `강의평가_목록`: 전체 강의평가 상세 데이터 (자동 열 너비 맞춤 적용)
     - `교수별_요약통계`: 교수별 평균 평점, 강의력, 과제 부담도, 시험 난이도 및 담당 과목 요약
     - `이수구분별_통계`: 전공/교양 구분별 평균 평점 및 부담도 비교
   - **한글 깨짐 방지 CSV 저장 (`.csv`)**: UTF-8 BOM이 적용되어 엑셀에서 즉시 열람 가능
   - **엑셀 파일 불러오기**: 기존 `.xlsx` 또는 `.csv` 파일을 업로드하여 목록에 병합
3. **데이터 조회 및 통계 뷰**
   - 강의명·교수명·학과·키워드 실시간 검색 및 학기/이수구분별 필터링
   - 스프레드시트 시트 미리보기 및 선택 행 부분 엑셀 내보내기
   - 브라우저 `localStorage` 자동 저장 지원

---

## GitHub에 업로드 및 배포하는 방법

### 방법 1: 단일 `index.html` 파일로 GitHub Pages에 1분 만에 올리기 (설치 불필요)
애플리케이션 상단 메뉴의 **[GitHub 업로드 & HTML]** 탭에서 **`index.html` 다운로드** (또는 **GitHub 업로드용 ZIP 다운로드**)를 클릭한 뒤:
1. GitHub에서 새 저장소(Repository)를 생성합니다.
2. **Add file** → **Upload files**를 눌러 다운로드한 `index.html`과 `README.md`를 업로드하고 **Commit changes**를 클릭합니다.
3. 저장소의 **Settings** → **Pages** 메뉴로 이동하여 **Branch**를 `main` (폴더 `/root`)으로 선택 후 **Save**를 누르면 `https://<본인아이디>.github.io/<저장소이름>/` 주소로 즉시 배포됩니다.

### 방법 2: React + TypeScript 전체 프로젝트 실행 및 배포
```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행 (http://localhost:3000)
npm run dev

# 3. 프로덕션 빌드 (dist 폴더 생성)
npm run build
```
본 저장소에는 `.github/workflows/deploy.yml` 워크플로우가 포함되어 있어, GitHub 저장소의 **Settings → Pages → Build and deployment**에서 **Source**를 `GitHub Actions`로 설정하면 `main` 브랜치 푸시 시 자동으로 빌드 및 배포됩니다.

---

## 기술 스택
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons
- **Excel Processing**: SheetJS (`xlsx`), UTF-8 BOM CSV
- **Build Tool**: Vite
