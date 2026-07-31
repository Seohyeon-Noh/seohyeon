import React, { useState } from "react";
import { Search, Sheet, Trash2, Eye, FileText, Download, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { AnalysisRecord } from "../types";

interface HistoryTableProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onSaveToSheet: (recordId: string) => Promise<boolean>;
  gasUrl: string;
  onOpenGasModal: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onSaveToSheet,
  gasUrl,
  onOpenGasModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const filteredRecords = records.filter(
    (r) =>
      r.studentInfo.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentInfo.affiliation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.analysis.testMeta.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSyncOne = async (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    if (!gasUrl) {
      onOpenGasModal();
      return;
    }
    setSyncingId(recordId);
    try {
      await onSaveToSheet(recordId);
    } finally {
      setSyncingId(null);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `심리검사_분석보관함_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>학생 심리검사 분석 보관함 ({records.length}건)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            지금까지 분석된 학생들의 검사 프로파일과 추천 피드백 기록입니다.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {records.length > 0 && (
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>백업 데이터 다운로드</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="학생 이름, 소속(학년/반), 검사명으로 검색..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">저장된 학생 심리분석 결과가 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? "검색 조건에 일치하는 기록이 없습니다." : "학생 정보와 PDF를 등록하여 첫 분석을 시작해 보세요."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">학생 이름 / 소속</th>
                <th className="py-3.5 px-4">생년월일</th>
                <th className="py-3.5 px-4">검사 명칭 및 주요 요약</th>
                <th className="py-3.5 px-4">분석 일시</th>
                <th className="py-3.5 px-4">구글 시트 연동</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => onSelectRecord(rec)}
                  className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                >
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <span>{rec.studentInfo.studentName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-semibold">
                        {rec.studentInfo.affiliation}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {rec.studentInfo.birthDate}
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-semibold text-slate-800 truncate">
                      {rec.analysis.testMeta.testTitle}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {rec.analysis.testMeta.overallSummary}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-xs font-mono">
                    {new Date(rec.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="py-4 px-4">
                    {rec.syncedToSheet ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>전송됨</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleSyncOne(e, rec.id)}
                        disabled={syncingId === rec.id}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
                      >
                        <Sheet className="w-3.5 h-3.5" />
                        <span>{syncingId === rec.id ? "전송 중..." : "시트 전송"}</span>
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(rec);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                        title="상세 보고서 보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`${rec.studentInfo.studentName} 학생의 분석 보관 기록을 삭제하시겠습니까?`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
