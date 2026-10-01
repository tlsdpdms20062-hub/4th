import React, { useState } from 'react';
import { Copy, Check, Download, Code2, Archive, ExternalLink, Terminal } from 'lucide-react';
import { CourseEvaluation } from '../types/evaluation';
import {
  downloadStandaloneHtmlFile,
  downloadVercelDeployZip,
  generateStandaloneHtmlSource,
} from '../utils/standaloneHtmlGenerator';

interface StandaloneHtmlViewProps {
  evaluations: CourseEvaluation[];
}

const VERCEL_JSON_PREVIEW = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

export const StandaloneHtmlView: React.FC<StandaloneHtmlViewProps> = ({ evaluations }) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const htmlCode = generateStandaloneHtmlSource(evaluations);

  const copyText = async (text: string, setFlag: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setFlag(true);
    setTimeout(() => setFlag(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadVercelDeployZip(evaluations);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vercel Deployment Kit Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              01. Vercel(버셀) 즉시 배포 패키지 및 가이드
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              현재 프로젝트 루트에 <code className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">vercel.json</code> 설정이 완료되어 있으며, 빌드 오류 없이 10초 만에 버셀에 올릴 수 있는 배포용 ZIP 패키지도 바로 다운로드할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadStandaloneHtmlFile(evaluations)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>index.html 단일 파일 다운로드</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                {downloadingZip
                  ? 'ZIP 생성 중...'
                  : 'Vercel 배포용 ZIP 다운로드 (index.html + vercel.json)'}
              </span>
            </button>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="font-mono-tabular text-xs font-bold text-[#0284C7] mb-1">
              STEP 01 · 파일 준비
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              배포용 ZIP 다운로드 또는 GitHub 연동
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              우측 상단의 <strong>Vercel 배포용 ZIP 다운로드</strong> 버튼을 눌러 압축을 풀거나, 전체 프로젝트를 내 GitHub 저장소(Repository)에 업로드합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="font-mono-tabular text-xs font-bold text-[#0284C7] mb-1">
              STEP 02 · Vercel에 연결
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              GitHub Import 또는 CLI 실행
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>vercel.com/new</strong> 에서 GitHub 저장소를 선택하고 <strong>Deploy</strong>를 클릭하거나, 폴더 터미널에서 <code className="font-mono bg-white px-1 py-0.5 border border-slate-200 rounded">npx vercel --prod</code> 를 입력합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="font-mono-tabular text-xs font-bold text-[#059669] mb-1">
              STEP 03 · 배포 완료
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              .vercel.app 주소 즉시 생성
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              약 10~20초 후 <code className="font-mono text-slate-800">https://프로젝트명.vercel.app</code> 주소가 발급되며, 강의평가 작성 및 엑셀(.xlsx) 저장 기능이 그대로 동작합니다.
            </p>
          </div>
        </div>

        {/* vercel.json & CLI quick block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate-700">
                /vercel.json (프로젝트 루트에 적용됨)
              </span>
              <button
                type="button"
                onClick={() => copyText(VERCEL_JSON_PREVIEW, setCopiedVercel)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {copiedVercel ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>설정 복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{VERCEL_JSON_PREVIEW}</code>
            </pre>
          </div>

          <div className="border border-slate-200 rounded-md p-4 flex flex-col justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                <Terminal className="w-4 h-4 text-[#0284C7]" />
                <span>터미널(CLI)로 10초 만에 올리는 명령어</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Node.js가 설치된 PC에서 다운로드한 ZIP 파일의 압축을 풀고 해당 폴더에서 아래 명령어를 실행하면 GitHub 없이도 즉시 버셀 주소가 생성됩니다.
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded space-y-1">
                <div># 1. 압축 푼 폴더에서 버셀 배포 실행</div>
                <div className="text-emerald-400">npx vercel --prod</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Vercel 대시보드에서 GitHub으로 배포하려면:</span>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#0284C7] hover:underline"
              >
                <span>vercel.com/new 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone index.html Code Preview */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#0284C7]" />
              <span>02. 무설치 단독 실행 index.html 전체 소스코드 ({evaluations.length}건 데이터 포함)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              별도 빌드 과정 없이 <code className="font-mono">index.html</code> 파일 하나만으로도 버셀(Vercel), GitHub Pages, Netlify에 바로 업로드할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyText(htmlCode, setCopiedHtml)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
            >
              {copiedHtml ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">HTML 코드 복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>index.html 코드 복사</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => downloadStandaloneHtmlFile(evaluations)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>index.html 다운로드</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950 text-slate-100 rounded-md p-4 overflow-x-auto max-h-[460px] border border-slate-800">
          <pre className="font-mono text-xs leading-relaxed select-all">
            <code>{htmlCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
