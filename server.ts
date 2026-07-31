import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Configure body parsing
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Configure Multer for file upload in memory (up to 7 files)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file limit
    files: 7, // Up to 7 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("PDF 또는 이미지 파일만 업로드 가능합니다."));
    }
  },
});

// Lazy Gemini AI initialization helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다. AI Studio 비밀키 panel에서 키를 설정해 주세요.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini PDF Analysis API Route (Supports up to 7 files)
app.post("/api/analyze-pdf", upload.array("files", 7), async (req: Request, res: Response): Promise<void> => {
  try {
    const rawFiles = req.files as Express.Multer.File[] | undefined;
    const uploadedFiles = rawFiles && rawFiles.length > 0 ? rawFiles : (req.file ? [req.file] : []);
    const { affiliation, studentName, birthDate } = req.body;

    if (!studentName || !affiliation || !birthDate) {
      res.status(400).json({ error: "소속, 학생 이름, 생년월일은 필수 입력 항목입니다." });
      return;
    }

    if (uploadedFiles.length === 0 && !req.body.sampleMode) {
      res.status(400).json({ error: "분석할 PDF 또는 심리검사지 파일을 최소 1개 이상 업로드해 주세요." });
      return;
    }

    const ai = getGeminiClient();

    const fileParts = uploadedFiles.map((f) => ({
      inlineData: {
        mimeType: f.mimetype,
        data: f.buffer.toString("base64"),
      },
    }));

    const fileListText = uploadedFiles.map((f, i) => `${i + 1}. ${f.originalname} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`).join("\n");

    const promptText = `
너는 학교 현장 교사들을 지원하는 전문 학교심리 및 상담 전문가 AI 분석기야.
첨부된 총 ${uploadedFiles.length}개의 학생 심리검사 결과지(PDF/이미지 등)를 종합적으로 정밀 분석하여, 아래 학생 정보를 바탕으로 교사가 학생을 깊이 이해하고 맞춤형 생활지도 및 학습상담을 진행할 수 있도록 통합 구조화된 종합 보고서를 작성해 줘.

[학생 정보]
- 소속 (학년/반): ${affiliation}
- 학생 이름: ${studentName}
- 생년월일: ${birthDate}
- 업로드된 검사지 목록 (${uploadedFiles.length}개):
${fileListText}

[분석 및 작성 지침]
1. 업로드된 모든 검사지(예: PAI-A, RCMAS-2, IESS-A, MBTI 등 여러 결과지)에 나와있는 주요 검사 척도, 점수, 수준, 심리 상태를 다각도로 연관지어 교차 검증 및 종합 파악할 것.
2. [프로파일 분석 지침]: 학생 본인과 학부모도 쉽게 이해할 수 있도록 '일상생활에서의 실제 예시'(예: 숙제/시험을 치를 때, 친구와 놀거나 대화할 때, 집이나 학교 생활에서의 모습 등)를 구체적으로 포함하여 친근하고 생생하게 설명할 것.
3. [맞춤형 추천 지침]: '맞춤형 학습 방법', '자기관리 & 습관 지도', '교사 상담 가이드'의 각 항목 문장 처음에 반드시 핵심 개념을 담은 #해시태그 (예: #소규모_분할학습, #시각자료_활용, #10분_정돈루틴, #3초_숨고르기, #개별조용한_피드백 등)를 포함하고 핵심 키워드를 강조할 것.
4. 한국어로 전문적이면서도 따뜻하고 명확하게 작성할 것.
5. 반드시 주어진 JSON 구조에 맞춰 응답할 것.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [...fileParts, { text: promptText }],
      },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testMeta: {
              type: Type.OBJECT,
              properties: {
                testTitle: { type: Type.STRING, description: "검사 명칭 (예: K-MIGI 종합심리검사, 학습정서 종합검사 등)" },
                testDate: { type: Type.STRING, description: "검사 실시일자 또는 추출된 날짜" },
                overallSummary: { type: Type.STRING, description: "검사 결과 2~3문장 요약" },
              },
              required: ["testTitle", "overallSummary"],
            },
            scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "검사 요인/영역명 (예: 자아개념, 학습동기, 정서안정성)" },
                  score: { type: Type.NUMBER, description: "원점수 또는 T점수/백분위" },
                  maxScore: { type: Type.NUMBER, description: "만점 기준 (기본값 100)" },
                  level: { type: Type.STRING, description: "수준 (예: 매우 높음, 양호, 관심 필요, 주의)" },
                  description: { type: Type.STRING, description: "해당 영의 해석 설명" },
                },
                required: ["category", "score", "level", "description"],
              },
              description: "검사 결과의 주요 점수 영역들",
            },
            profile: {
              type: Type.OBJECT,
              properties: {
                cognitiveTrait: { type: Type.STRING, description: "1. 인지 및 학습적 특성 분석 (학생이 쉽게 이해할 수 있도록 일상 생활 상황/예시 포함)" },
                emotionalTrait: { type: Type.STRING, description: "2. 정서 및 심리적 특성 분석 (학생이 쉽게 이해할 수 있도록 일상 생활 상황/예시 포함)" },
                socialTrait: { type: Type.STRING, description: "3. 대인관계 및 사회성 특성 분석 (학생이 쉽게 이해할 수 있도록 일상 생활 상황/예시 포함)" },
                overallProfile: { type: Type.STRING, description: "4. 종합 검사 프로파일 요약 (학생 맞춤 일상 예시 포함 종합 총평)" },
              },
              required: ["cognitiveTrait", "emotionalTrait", "socialTrait", "overallProfile"],
            },
            strengthsWeaknesses: {
              type: Type.OBJECT,
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "학생의 대표적인 강점 (3~5가지, 일상 예시 포함)",
                },
                weaknesses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "학생의 취약점 및 보완이 필요한 유의점 (3~5가지, 일상 예시 포함)",
                },
              },
              required: ["strengths", "weaknesses"],
            },
            recommendations: {
              type: Type.OBJECT,
              properties: {
                learningMethods: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "성향에 맞는 구체적 학습방법 추천 (각 항목은 #해시태그 로 시작하며 주요 개념을 강조)",
                },
                selfManagement: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "자기관리 및 규칙적 생활 습관 코칭 추천 (각 항목은 #해시태그 로 시작하며 주요 개념을 강조)",
                },
                teacherAdvice: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "담임/교사를 위한 개별 지도 및 상담 가이드라인 (각 항목은 #해시태그 로 시작하며 주요 개념을 강조)",
                },
              },
              required: ["learningMethods", "selfManagement", "teacherAdvice"],
            },
          },
          required: ["testMeta", "scores", "profile", "strengthsWeaknesses", "recommendations"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      res.status(500).json({ error: "Gemini AI로부터 분석 결과를 수신하지 못했습니다." });
      return;
    }

    const parsedResult = JSON.parse(resultText);

    res.json({
      success: true,
      studentInfo: {
        affiliation,
        studentName,
        birthDate,
      },
      analysis: parsedResult,
    });
  } catch (error: any) {
    console.error("Gemini PDF Analysis Error:", error);
    res.status(500).json({
      error: error?.message || "PDF 분석 중 오류가 발생했습니다. 파일 형태를 확인해 주세요.",
    });
  }
});

// Proxy to GAS Endpoint (optional helper to bypass browser CORS constraints if needed)
app.post("/api/proxy-gas", async (req: Request, res: Response): Promise<void> => {
  try {
    const { gasUrl, payload } = req.body;
    if (!gasUrl || !payload) {
      res.status(400).json({ error: "GAS Web App URL과 전송할 데이터가 필요합니다." });
      return;
    }

    const gasRes = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const text = await gasRes.text();
    res.json({ success: true, responseText: text });
  } catch (err: any) {
    console.error("GAS Proxy error:", err);
    res.status(500).json({ error: "구글 시트 연동 전송 중 오류가 발생했습니다: " + err.message });
  }
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
