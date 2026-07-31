import React from "react";
import { Brain, Sheet, HelpCircle, FileText } from "lucide-react";

interface HeaderProps {
  gasUrl: string;
  onOpenGasModal: () => void;
  activeTab: "analyze" | "history";
  setActiveTab: (tab: "analyze" | "history") => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  gasUrl,
  onOpenGasModal,
  activeTab,
  setActiveTab,
  historyCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("analyze")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">심리검사 결과 분석기</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                교사용 AI 지원
              </span>
            </div>
            <p className="text-xs text-slate-5-00 hidden sm:block">학생 심리검사 PDF 정밀 분석 및 구글 시트 연동 시스템</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <nav className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab("analyze")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "analyze"
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>검사 분석</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sheet className="w-4 h-4" />
              <span>분석 보관함</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-800">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* GAS Link Button */}
          <button
            onClick={onOpenGasModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-all ${
              gasUrl
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse"
            }`}
            title="구글 시트 연동 설정"
          >
            <Sheet className="w-4 h-4" />
            <span className="font-medium hidden md:inline">
              {gasUrl ? "구글시트 연결됨" : "구글시트 설정 필요"}
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
