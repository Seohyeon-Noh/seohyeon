import React, { useState } from "react";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  UserCheck,
  Sheet,
  Printer,
  Sparkles,
  Share2,
  Calendar,
  School,
  User,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnalysisRecord, GasPayload } from "../types";

interface AnalysisReportProps {
  record: AnalysisRecord;
  gasUrl: string;
  onOpenGasModal: () => void;
  onSaveToSheet: (recordId: string) => Promise<boolean>;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  record,
  gasUrl,
  onOpenGasModal,
  onSaveToSheet,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "profile" | "strengths" | "recommendations">("all");

  const { studentInfo, analysis, syncedToSheet } = record;

  const handleSheetSync = async () => {
    if (!gasUrl) {
      onOpenGasModal();
      return;
    }

    setIsSyncing(true);
    setSyncStatus("idle");
    setStatusMessage("");

    try {
      const success = await onSaveToSheet(record.id);
      if (success) {
        setSyncStatus("success");
        setStatusMessage("구글 시트에 학생 심리분석 결과가 성공적으로 등록되었습니다!");
      } else {
        setSyncStatus("error");
        setStatusMessage("구글 시트 전송 중 오류가 발생했습니다. GAS URL 설정을 확인하세요.");
      }
    } catch (err: any) {
      setSyncStatus("error");
      setStatusMessage(err.message || "구글 시트 전송에 실패했습니다.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Color helper for scores
  const getScoreBadgeColor = (level: string) => {
    if (level.includes("우수") || level.includes("높음") || level.includes("양호")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (level.includes("주의") || level.includes("관심") || level.includes("낮음") || level.includes("취약")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* Top Action Bar & Sync Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {studentInfo.studentName} 학생 심리분석 보고서
            </h3>
            <p className="text-xs text-slate-500">
              {studentInfo.affiliation} • {studentInfo.birthDate} • AI 종합 진단 완료
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>보고서 인쇄 / PDF 저장</span>
          </button>

          {/* Save to Google Sheets Button */}
          <button
            onClick={handleSheetSync}
            disabled={isSyncing}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
              syncedToSheet
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
            }`}
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>시트 전송 중...</span>
              </>
            ) : syncedToSheet ? (
              <>
                <Check className="w-4 h-4" />
                <span>구글 시트 저장 완료 (재전송 가능)</span>
              </>
            ) : (
              <>
                <Sheet className="w-4 h-4" />
                <span>구글 시트에 저장하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all print:hidden ${
            syncStatus === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {syncStatus === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage("")}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            닫기
          </button>
        </div>
      )}

      {/* Student Profile Card Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {analysis.testMeta.testTitle || "학생 심리검사 분석결과"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {studentInfo.studentName} <span className="text-indigo-200 font-normal">학생 심리 프로파일</span>
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-100/80 pt-1">
              <span className="flex items-center space-x-1">
                <School className="w-4 h-4 text-indigo-300" />
                <span>소속: {studentInfo.affiliation}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-indigo-300" />
                <span>생년월일: {studentInfo.birthDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-indigo-300" />
                <span>검사/분석일: {analysis.testMeta.testDate || new Date().toLocaleDateString("ko-KR")}</span>
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl md:max-w-xs">
            <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider mb-1">
              종합 요약 (Executive Summary)
            </p>
            <p className="text-xs text-white/90 leading-relaxed">
              {analysis.testMeta.overallSummary}
            </p>
          </div>
        </div>

        {/* Major Score Category Progress Bars */}
        {analysis.scores && analysis.scores.length > 0 && (
          <div className="pt-6">
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4">
              검사 영역별 점수 분포
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysis.scores.map((sc, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate">{sc.category}</span>
                    <span className="text-xs font-extrabold text-indigo-200">
                      {sc.score}점 <span className="text-[10px] text-white/60">/ {sc.maxScore || 100}</span>
                    </span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-indigo-400 to-indigo-200 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (sc.score / (sc.maxScore || 100)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/70 truncate">{sc.description}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getScoreBadgeColor(sc.level)}`}>
                      {sc.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: 종합 검사 프로파일 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">종합 검사 프로파일</h3>
            <p className="text-xs text-slate-500">학생의 인지, 정서, 대인관계 측면의 입체적 심리 분석 결과입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 인지 및 학습적 특성 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-200 transition-all">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-3">
              <BookOpen className="w-4 h-4" />
              <span>인지 및 학습적 특성</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis.profile.cognitiveTrait}
            </p>
          </div>

          {/* 정서 및 심리적 특성 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-200 transition-all">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-3">
              <Brain className="w-4 h-4" />
              <span>정서 및 심리적 특성</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis.profile.emotionalTrait}
            </p>
          </div>

          {/* 대인관계 및 사회성 특성 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-200 transition-all">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-3">
              <UserCheck className="w-4 h-4" />
              <span>대인관계 및 사회성</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis.profile.socialTrait}
            </p>
          </div>
        </div>

        {/* 종합 프로파일 총평 */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
            종합 프로파일 요약 총평
          </h4>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {analysis.profile.overallProfile}
          </p>
        </div>
      </div>

      {/* SECTION 2: 학생의 강점 및 약점 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">학생의 강점 및 약점 (취약점)</h3>
            <p className="text-xs text-slate-500">학생이 보유한 주요 핵심 강점과 지도 시 주의가 필요한 유의사항입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 강점 영역 */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base mb-4 pb-2 border-b border-emerald-200/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>핵심 강점 (Strengths)</span>
            </div>
            <ul className="space-y-3">
              {analysis.strengthsWeaknesses.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 약점 / 유의점 영역 */}
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-base mb-4 pb-2 border-b border-amber-200/60">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>보완 필요 및 유의점 (Weaknesses)</span>
            </div>
            <ul className="space-y-3">
              {analysis.strengthsWeaknesses.weaknesses.map((wk, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <span className="leading-relaxed">{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3: 성향에 맞는 학습방법 및 자기관리 추천 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">맞춤형 학습방법 및 생활지도 추천</h3>
            <p className="text-xs text-slate-500">학생의 성향에 최적화된 학습 코칭과 교사를 위한 개별 상담 가이드입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 성향 맞춤 학습방법 */}
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-indigo-800 font-bold text-sm mb-4 pb-2 border-b border-indigo-200/60">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>맞춤형 학습 방법</span>
            </div>
            <ul className="space-y-3">
              {analysis.recommendations.learningMethods.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 자기관리 및 습관 코칭 */}
          <div className="bg-sky-50/30 border border-sky-100 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-sky-800 font-bold text-sm mb-4 pb-2 border-b border-sky-200/60">
              <Lightbulb className="w-4 h-4 text-sky-600" />
              <span>자기관리 & 습관 지도</span>
            </div>
            <ul className="space-y-3">
              {analysis.recommendations.selfManagement.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 flex-shrink-0 mt-2" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 교사 개별 지도 및 상담 조언 */}
          <div className="bg-purple-50/30 border border-purple-100 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-purple-800 font-bold text-sm mb-4 pb-2 border-b border-purple-200/60">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>담임/교사 상담 가이드</span>
            </div>
            <ul className="space-y-3">
              {analysis.recommendations.teacherAdvice.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0 mt-2" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Save Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
        <div>
          <h4 className="text-base font-bold flex items-center space-x-2">
            <Sheet className="w-5 h-5 text-emerald-400" />
            <span>이 분석 결과를 학급 구글 시트에 즉시 기록하시겠습니까?</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            소속({studentInfo.affiliation}), 이름({studentInfo.studentName}), 생년월일, 종합 프로파일 및 맞춤 피드백 데이터가 지정된 GAS 시트로 전송됩니다.
          </p>
        </div>
        <button
          onClick={handleSheetSync}
          disabled={isSyncing}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer flex-shrink-0 flex items-center justify-center space-x-2"
        >
          {isSyncing ? (
            <span>전송 처리 중...</span>
          ) : (
            <>
              <Sheet className="w-4 h-4" />
              <span>구글 시트에 저장하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
