import React, { useState, useRef } from "react";
import { Upload, FileCheck, AlertCircle, Sparkles, User, School, Calendar, RefreshCw, X, Plus, Trash2, FileText } from "lucide-react";
import { StudentInput } from "../types";

interface StudentFormProps {
  studentInput: StudentInput;
  setStudentInput: React.Dispatch<React.SetStateAction<StudentInput>>;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onAnalyze: () => void;
  isLoading: boolean;
  onLoadSample: () => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  studentInput,
  setStudentInput,
  selectedFiles,
  setSelectedFiles,
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

  const processAndAddFiles = (fileList: FileList | File[]) => {
    const newFilesArray = Array.from(fileList);
    const validFiles: File[] = [];

    if (selectedFiles.length + newFilesArray.length > 7) {
      setError(`최대 7개까지 파일 등록이 가능합니다. (현재 ${selectedFiles.length}개 등록됨)`);
      return;
    }

    let currentTotalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

    for (const file of newFilesArray) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        setError(`'${file.name}'은(는) 지원되지 않는 형식입니다. PDF 또는 이미지 파일만 업로드할 수 있습니다.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`'${file.name}' 단일 파일 용량이 10MB를 초과합니다. 10MB 이하의 파일을 선택해 주세요.`);
        return;
      }
      if (currentTotalBytes + file.size > 15 * 1024 * 1024) {
        setError(`전체 업로드 파일 용량 합계가 15MB를 초과할 수 없습니다. (현재 선택 용량: ${(currentTotalBytes / (1024 * 1024)).toFixed(1)}MB). 대표 결과지 위주로 선택해 주세요.`);
        return;
      }
      currentTotalBytes += file.size;
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndAddFiles(e.target.files);
      // Reset input value so same files can be re-selected if removed
      e.target.value = "";
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
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
    if (selectedFiles.length === 0) {
      setError("분석할 심리검사 PDF/이미지 결과지 파일을 최소 1개 이상 첨부해 주세요.");
      return;
    }

    onAnalyze();
  };

  const totalSizeMB = (selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>학생 정보 및 복수 심리검사 결과지 등록</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            학생의 인적사항을 입력하고 심리검사 결과지(PAI-A, RCMAS-2, IESS-A 등 최대 7개)를 등록하면 AI가 다각도로 종합 분석합니다.
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

        {/* PDF 및 검사지 다중 업로드 영역 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>심리검사 결과지 등록 (최대 7개) <span className="text-rose-500">*</span></span>
            </label>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {selectedFiles.length} / 7개 등록됨 (총 {totalSizeMB} MB)
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag & Drop Dropzone */}
          {selectedFiles.length < 7 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                selectedFiles.length === 0 ? "p-8" : "p-4 border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/60 mb-4"
              } ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/70 scale-[0.99]"
                  : "border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              {selectedFiles.length === 0 ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    심리검사 PDF 결과지 파일들을 이곳에 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PAI-A, RCMAS-2, IESS-A 등 표준 심리검사 PDF 및 이미지 지원 (최대 7개, 전체 합계 15MB 제한)
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-indigo-700 font-bold text-xs">
                  <Plus className="w-4 h-4" />
                  <span>검사지 파일 추가 등록하기 ({7 - selectedFiles.length}개 더 추가 가능)</span>
                </div>
              )}
            </div>
          )}

          {/* 선택된 파일 목록 UI */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>분석 대상 등록 파일 목록</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearAllFiles}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>전체 취소</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center justify-between shadow-2xs hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      title="파일 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
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
                <span>AI가 {selectedFiles.length > 0 ? `${selectedFiles.length}개의 검사지` : "검사지"}를 종합 분석 중입니다 (약 5~15초 소요)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gemini AI 종합 심리검사 결과 분석 실행하기 ({selectedFiles.length}개 파일)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
