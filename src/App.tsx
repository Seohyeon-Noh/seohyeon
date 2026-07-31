import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StudentForm } from "./components/StudentForm";
import { AnalysisReport } from "./components/AnalysisReport";
import { HistoryTable } from "./components/HistoryTable";
import { GasConfigModal } from "./components/GasConfigModal";
import { StudentInput, AnalysisRecord, AnalysisResult } from "./types";
import { SAMPLE_RECORDS } from "./data/sampleData";
import { Brain, FileText, CheckCircle2, AlertCircle, Sparkles, Sheet } from "lucide-react";

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");

  // Student Input state
  const [studentInput, setStudentInput] = useState<StudentInput>({
    affiliation: "5학년 2반",
    studentName: "김민준",
    birthDate: "2015-04-12",
  });

  // Selected PDF/Image Files (up to 7)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Active or Current Record being viewed/analyzed
  const [currentRecord, setCurrentRecord] = useState<AnalysisRecord | null>(SAMPLE_RECORDS[0]);

  // History Records stored in localStorage
  const [records, setRecords] = useState<AnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem("psy_analysis_records");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : SAMPLE_RECORDS;
      }
    } catch (e) {
      console.error("Failed to load records from localStorage", e);
    }
    return SAMPLE_RECORDS;
  });

  // Google Apps Script Web App URL
  const [gasUrl, setGasUrl] = useState<string>(() => {
    return localStorage.getItem("psy_gas_url") || "";
  });

  // Modal State
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);

  // Analysis Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Error State
  const [error, setError] = useState<string | null>(null);

  // Success Toast Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("psy_analysis_records", JSON.stringify(records));
    } catch (e) {
      console.error("Failed to save records to localStorage", e);
    }
  }, [records]);

  // Save GAS URL to localStorage
  useEffect(() => {
    localStorage.setItem("psy_gas_url", gasUrl);
  }, [gasUrl]);

  // Auto hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handler: Load Sample Data
  const handleLoadSample = () => {
    const sample = SAMPLE_RECORDS[0];
    setStudentInput(sample.studentInfo);
    setCurrentRecord(sample);
    setSelectedFiles([]);
    setError(null);
    setToastMessage("샘플 학생(김민준)의 심리검사 프로파일 데이터를 불러왔습니다.");
  };

  // Handler: Analyze PDF/Image Files via Express Backend API (/api/analyze-pdf)
  const handleAnalyzePDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (selectedFiles.length === 0) {
        throw new Error("분석할 심리검사 결과지 파일을 최소 1개 이상 선택해 주세요.");
      }

      const totalBytes = selectedFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalBytes > 15 * 1024 * 1024) {
        throw new Error(
          `선택하신 전체 파일 용량(${(totalBytes / (1024 * 1024)).toFixed(1)}MB)이 제한(15MB)을 초과합니다. 15MB 이하로 첨부해 주세요.`
        );
      }

      // Convert files to Base64 in parallel
      const convertedFiles = await Promise.all(
        selectedFiles.map((file) => {
          return new Promise<{ name: string; mimeType: string; data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              // Extract pure base64 payload
              const base64Data = res.includes(",") ? res.split(",")[1] : res;
              resolve({
                name: file.name,
                mimeType: file.type || "application/pdf",
                data: base64Data,
              });
            };
            reader.onerror = () => reject(new Error(`'${file.name}' 파일을 읽는 데 실패했습니다.`));
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          affiliation: studentInput.affiliation.trim(),
          studentName: studentInput.studentName.trim(),
          birthDate: studentInput.birthDate,
          files: convertedFiles,
        }),
      });

      if (response.status === 404) {
        throw new Error(
          "서버 연결 오류(404): 전송 데이터 크기가 인프라 제한을 초과했거나 네트워크 연결이 끊어졌습니다. 첨부파일의 개수를 줄이거나 더 적은 용량의 파일로 다시 시도해 주세요."
        );
      }

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        const cleanMessage = responseText.replace(/<[^>]*>?/gm, "").trim().substring(0, 120);
        throw new Error(
          response.ok
            ? "서버 응답 데이터 형식을 읽지 못했습니다."
            : `서버 응답 오류 (${response.status}): ${cleanMessage || "알 수 없는 오류가 발생했습니다."}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "검사지 분석 중 오류가 발생했습니다. 파일 형식을 확인해 주세요.");
      }

      const newRecord: AnalysisRecord = {
        id: "rec-" + Date.now(),
        studentInfo: {
          affiliation: studentInput.affiliation.trim(),
          studentName: studentInput.studentName.trim(),
          birthDate: studentInput.birthDate,
        },
        analysis: data.analysis as AnalysisResult,
        createdAt: new Date().toISOString(),
        syncedToSheet: false,
      };

      setRecords((prev) => [newRecord, ...prev]);
      setCurrentRecord(newRecord);
      setToastMessage(`${studentInput.studentName} 학생의 (${selectedFiles.length}개 검사지) 통합 분석이 완료되었습니다!`);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err?.message || "파일 처리 실패: 파일이 손상되었거나 지원되지 않는 문서 형식입니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Transmit Record to Google Sheets
  const handleSaveToSheet = async (recordId: string): Promise<boolean> => {
    const targetRecord = records.find((r) => r.id === recordId) || currentRecord;
    if (!targetRecord) return false;

    if (!gasUrl) {
      setIsGasModalOpen(true);
      return false;
    }

    try {
      const payload = {
        affiliation: targetRecord.studentInfo.affiliation,
        studentName: targetRecord.studentInfo.studentName,
        birthDate: targetRecord.studentInfo.birthDate,
        profile: targetRecord.analysis.profile,
        strengthsWeaknesses: targetRecord.analysis.strengthsWeaknesses,
        recommendations: targetRecord.analysis.recommendations,
        createdAt: targetRecord.createdAt,
      };

      const res = await fetch("/api/proxy-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gasUrl: gasUrl.trim(),
          payload: payload,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? { ...r, syncedToSheet: true, sheetSyncedAt: new Date().toISOString() }
              : r
          )
        );

        if (currentRecord?.id === recordId) {
          setCurrentRecord((prev) =>
            prev ? { ...prev, syncedToSheet: true, sheetSyncedAt: new Date().toISOString() } : null
          );
        }

        setToastMessage(`${targetRecord.studentInfo.studentName} 학생 데이터가 구글 시트에 성공적으로 저장되었습니다!`);
        return true;
      } else {
        throw new Error(data.error || "구글 시트 저장 처리 실패");
      }
    } catch (err: any) {
      console.error("Sheet Sync Error:", err);
      return false;
    }
  };

  // Handler: Delete Record
  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    if (currentRecord?.id === recordId) {
      setCurrentRecord(null);
    }
    setToastMessage("기록이 삭제되었습니다.");
  };

  // Handler: Select Record from History
  const handleSelectRecord = (record: AnalysisRecord) => {
    setCurrentRecord(record);
    setStudentInput(record.studentInfo);
    setActiveTab("analyze");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white pb-16">
      {/* Navbar */}
      <Header
        gasUrl={gasUrl}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={records.length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center space-x-3 text-xs sm:text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "analyze" ? (
          <div className="space-y-8">
            {/* Input & Upload Form Section */}
            <StudentForm
              studentInput={studentInput}
              setStudentInput={setStudentInput}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              onAnalyze={handleAnalyzePDF}
              isLoading={isLoading}
              onLoadSample={handleLoadSample}
              error={error}
              setError={setError}
            />

            {/* Analysis Report Results */}
            {currentRecord ? (
              <AnalysisReport
                record={currentRecord}
                gasUrl={gasUrl}
                onOpenGasModal={() => setIsGasModalOpen(true)}
                onSaveToSheet={handleSaveToSheet}
              />
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">분석된 학생 심리검사 결과가 없습니다</h3>
                <p className="text-xs text-slate-500 mt-1">
                  위 입력 폼에서 학생 정보와 PDF를 업로드하시거나 '샘플 데이터 체험하기'를 클릭해 주세요.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* History Archive Tab */
          <HistoryTable
            records={records}
            onSelectRecord={handleSelectRecord}
            onDeleteRecord={handleDeleteRecord}
            onSaveToSheet={handleSaveToSheet}
            gasUrl={gasUrl}
            onOpenGasModal={() => setIsGasModalOpen(true)}
          />
        )}
      </main>

      {/* GAS Setup Modal */}
      <GasConfigModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        gasUrl={gasUrl}
        setGasUrl={setGasUrl}
      />
    </div>
  );
}
