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

  // Selected PDF File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    setSelectedFile(null);
    setError(null);
    setToastMessage("샘플 학생(김민준)의 심리검사 프로파일 데이터를 불러왔습니다.");
  };

  // Handler: Analyze PDF File via Express Backend API (/api/analyze-pdf)
  const handleAnalyzePDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("affiliation", studentInput.affiliation.trim());
      formData.append("studentName", studentInput.studentName.trim());
      formData.append("birthDate", studentInput.birthDate);

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        throw new Error("분석할 심리검사 PDF 파일을 선택해 주세요.");
      }

      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "PDF 분석 중 오류가 발생했습니다. 파일 형식을 확인해 주세요.");
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
      setToastMessage(`${studentInput.studentName} 학생의 심리검사 분석이 완료되었습니다!`);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err?.message || "PDF 처리 실패: 파일이 손상되었거나 지원되지 않는 PDF 형식입니다.");
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
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
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
