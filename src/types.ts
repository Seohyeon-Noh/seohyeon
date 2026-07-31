export interface StudentInput {
  affiliation: string; // 소속 (학년/반)
  studentName: string; // 이름
  birthDate: string;   // 생년월일 (YYYY-MM-DD)
}

export interface TestMeta {
  testTitle: string;
  testDate?: string;
  overallSummary: string;
}

export interface ScoreCategory {
  category: string;
  score: number;
  maxScore: number;
  level: string; // 예: 매우 높음, 양호, 관심 필요, 주의
  description: string;
}

export interface ProfileSection {
  cognitiveTrait: string;  // 인지 및 학습적 특성
  emotionalTrait: string;  // 정서 및 심리적 특성
  socialTrait: string;     // 대인관계 및 사회성 특성
  overallProfile: string;  // 종합 프로파일
}

export interface StrengthsWeaknesses {
  strengths: string[];  // 강점
  weaknesses: string[]; // 약점 및 유의점
}

export interface Recommendations {
  learningMethods: string[]; // 맞춤 학습방법
  selfManagement: string[]; // 자기관리 및 생활지침
  teacherAdvice: string[];  // 교사 개별 지도 및 상담 조언
}

export interface AnalysisResult {
  testMeta: TestMeta;
  scores: ScoreCategory[];
  profile: ProfileSection;
  strengthsWeaknesses: StrengthsWeaknesses;
  recommendations: Recommendations;
}

export interface AnalysisRecord {
  id: string;
  studentInfo: StudentInput;
  analysis: AnalysisResult;
  createdAt: string;
  syncedToSheet: boolean;
  sheetSyncedAt?: string;
}

export interface GasPayload {
  affiliation: string;
  studentName: string;
  birthDate: string;
  profile: string | ProfileSection;
  strengthsWeaknesses: string | StrengthsWeaknesses;
  recommendations: string | Recommendations;
  createdAt?: string;
}
