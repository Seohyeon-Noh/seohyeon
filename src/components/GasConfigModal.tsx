import React, { useState } from "react";
import { X, Sheet, Copy, Check, ExternalLink, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { GAS_SCRIPT_TEMPLATE } from "../data/sampleData";

interface GasConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  setGasUrl: (url: string) => void;
}

export const GasConfigModal: React.FC<GasConfigModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  setGasUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = () => {
    setGasUrl(inputUrl.trim());
    onClose();
  };

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, message: "구글 스크립트 웹앱 URL을 입력해 주세요." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test payload according to spec
      const testPayload = {
        affiliation: "테스트 학급",
        studentName: "연동테스트",
        birthDate: "2026-01-01",
        profile: { overallProfile: "연동 테스트 프로파일 데이터입니다." },
        strengthsWeaknesses: { strengths: ["테스트 강점"], weaknesses: ["테스트 약점"] },
        recommendations: { learningMethods: ["테스트 추천"], selfManagement: [], teacherAdvice: [] },
      };

      const response = await fetch("/api/proxy-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gasUrl: inputUrl.trim(),
          payload: testPayload,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: "구글 시트 연동 테스트에 성공했습니다! 구글 시트 첫 줄에 데이터가 기록되었는지 확인해 보세요.",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "연동 실패. GAS 배포 설정(액세스 권한: 모든 사용자)을 확인하세요.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "연동 오류: " + (err.message || "서버 통신 실패"),
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">구글 시트 연동 설정 (Google Apps Script)</h3>
              <p className="text-xs text-slate-300">학생 심리검사 분석 데이터를 구글 시트에 자동 저장하는 설정입니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Input URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. 배포된 구글 앱스 스크립트 웹앱 URL (GAS Web App URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1"
              >
                {isTesting ? "테스트 중..." : "연동 테스트"}
              </button>
            </div>
            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Step 2: Google Apps Script Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>구글 시트 연동 코드 생성 (무료, 2분 소요)</span>
              </h4>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>코드 복사완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>GAS 코드 전체 복사</span>
                  </>
                )}
              </button>
            </div>

            <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed font-medium">
              <li>사용할 구글 시트를 열고, 상단 메뉴의 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.</li>
              <li>화면의 기본 코드를 지우고, 위 <strong>[GAS 코드 전체 복사]</strong> 버튼을 눌러 복사된 코드를 붙여넣습니다.</li>
              <li>우측 상단 <strong>[배포] → [새 배포]</strong> 버튼을 누르고, 유형을 <strong>'웹 앱'</strong>으로 선택합니다.</li>
              <li>
                액세스 권한이 있는 사용자를 반드시 <strong className="text-rose-600">[모든 사용자 (Anyone)]</strong>로 설정 후 배포합니다.
              </li>
              <li>생성된 웹 앱 URL(<code className="bg-slate-200 px-1 rounded text-[11px]">https://script.google.com/macros/s/...</code>)을 위 입력창에 붙여넣습니다.</li>
            </ol>

            {/* Script Code Box */}
            <div className="relative mt-3">
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] font-mono leading-relaxed max-h-48 overflow-y-auto border border-slate-800">
                {GAS_SCRIPT_TEMPLATE}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveUrl}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
