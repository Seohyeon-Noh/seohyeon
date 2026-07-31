import React, { useState, useRef } from "react";
import { Upload, FileCheck, AlertCircle, Sparkles, User, School, Calendar, RefreshCw, HelpCircle } from "lucide-react";
import { StudentInput } from "../types";

interface StudentFormProps {
  studentInput: StudentInput;
  setStudentInput: React.Dispatch<React.SetStateAction<StudentInput>>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  onAnalyze: (fileToAnalyze?: File) => void;
  isLoading: boolean;
  onLoadSample: () => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  studentInput,
  setStudentInput,
  selectedFile,
  setSelectedFile,
  onAnalyze,
  isLoading,
  onLoadSample,
  error,
  setError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentInput((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      setError("PDF 형식의 심리검사 결과지 파일만 업로드 가능합니다.");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("파일 용량이 20MB를 초과할 수 없습니다.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.affiliation.trim()) {
      setError("소속(학년/반)을 입력해 주세요. (예: 5학년 2반)");
      return;
    }
    if (!studentInput.studentName.trim()) {
      setError("학생 이름을 입력해 주세요.");
      return;
    }
    if (!studentInput.birthDate) {
      setError("학생의 생년월일을 선택해 주세요.");
      return;
    }
    if (!selectedFile) {
      setError("분석할 심리검사 PDF 결과지 파일을 첨부해 주세요.");
      return;
    }

    onAnalyze();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>학생 정보 및 심리검사 PDF 등록</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            분석 대상 학생의 인적사항을 입력하고 결과지 PDF를 업로드하면 AI가 맞춤형 보고서를 생성합니다.
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <button
            type="button"
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>샘플 데이터로 바로 체험하기</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-700 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <span className="font-semibold">입력 오류: </span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 학생 기본정보 3열 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* 소속 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="flex items-center space-x-1">
                <School className="w-3.5 h-3.5 text-indigo-500" />
                <span>소속 (학년/반) <span className="text-rose-500">*</span></span>
              </span>
            </label>
            <input
              type="text"
              name="affiliation"
              value={studentInput.affiliation}
              onChange={handleInputChange}
              placeholder="예: 3학년 2반, 5학년 1반"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>학생 이름 <span className="text-rose-500">*</span></span>
              </span>
            </label>
            <input
              type="text"
              name="studentName"
              value={studentInput.studentName}
              onChange={handleInputChange}
              placeholder="예: 김철수"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>생년월일 <span className="text-rose-500">*</span></span>
              </span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={studentInput.birthDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>
        </div>

        {/* PDF 파일 업로드 영역 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <span>심리검사 결과지 PDF 업로드 <span className="text-rose-500">*</span></span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                심리검사 PDF 결과지 파일을 이곳에 드래그하거나 클릭하여 선택하세요
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PAI-A, RCMAS-2, IESS-A 등 모든 표준 심리검사 PDF 지원 (최대 20MB)
              </p>
            </div>
          ) : (
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-indigo-600 font-medium">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF 문서 준비완료
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all cursor-pointer flex-shrink-0"
              >
                파일 변경
              </button>
            </div>
          )}
        </div>

        {/* 제출 및 분석 시작 버튼 */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-indigo-200 cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AI가 PDF 검사지를 분석 중입니다 (약 5~10초 소요)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gemini AI 심리검사 결과 분석 실행하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
