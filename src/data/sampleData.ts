import { AnalysisRecord } from "../types";

export const SAMPLE_RECORDS: AnalysisRecord[] = [
  {
    id: "sample-1",
    studentInfo: {
      affiliation: "5학년 2반",
      studentName: "김민준",
      birthDate: "2015-04-12",
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    syncedToSheet: false,
    analysis: {
      testMeta: {
        testTitle: "종합 아동 심리 및 학습역량 검사 (K-MIGI)",
        testDate: "2026-07-20",
        overallSummary:
          "높은 호기심과 창의적 문제해결 능력을 지녔으나, 과제 지속력 및 스트레스 관리 영역에서 다소 기복을 보이는 성향입니다.",
      },
      scores: [
        {
          category: "자아개념 및 자존감",
          score: 88,
          maxScore: 100,
          level: "매우 우수",
          description: "자신에 대한 긍정적 신념이 강하며 자기표현력이 우수함",
        },
        {
          category: "학습동기 및 집중력",
          score: 62,
          maxScore: 100,
          level: "보통",
          description: "관심 주제에는 깊이 몰입하나 지루한 반복 과제에서는 집중력이 저하됨",
        },
        {
          category: "정서적 안정성",
          score: 55,
          maxScore: 100,
          level: "관심 필요",
          description: "평가 상황이나 실패 시 불안감이 다소 높아질 수 있음",
        },
        {
          category: "대인관계 및 협동성",
          score: 82,
          maxScore: 100,
          level: "우수",
          description: "또래 관계에서 리더십을 발휘하며 타인 공감 능력이 높음",
        },
      ],
      profile: {
        cognitiveTrait:
          "새로운 개념에 대한 이해 속도가 빠르고 시각적/체험적 자료를 활용한 학습에 매우 효과적입니다. 주도적 탐구에는 강하나 긴 글 읽기나 반복적 문제 풀이에는 쉽게 피로감을 느낍니다.",
        emotionalTrait:
          "기본적으로 밝고 긍정적이나, 자신의 과오나 지적에 솔직히 반응하는 과정에서 정서적 방어기제가 작동할 수 있습니다. 자존심이 강하여 조용한 피드백이 효과적입니다.",
        socialTrait:
          "또래 집단에서 긍정적 영향력을 미치며 학급 활동이나 모둠 과제에서 아이디어를 주도적으로 제안하는 경향이 뛰어납니다.",
        overallProfile:
          "김민준 학생은 자존감과 대인관계 지수(80점 이상)가 매우 높은 활달한 성향입니다. 다만 정서 안정성 및 단순 집중 유지력이 50-60점대로 조절 관리가 지속적으로 요구되는 지능형 활력 유형입니다.",
      },
      strengthsWeaknesses: {
        strengths: [
          "풍부한 호기심과 창의적인 아이디어 제시 능력",
          "또래 친구들과의 우수한 소통 및 경청 태도",
          "새로운 도전 과제에 적극적으로 참여하려는 높은 의지",
          "시각적/구체적 매체를 활용한 개념 이해력 우수",
        ],
        weaknesses: [
          "단순/반복 학습 시 사소한 산만함 발생",
          "성과가 즉각 나지 않는 장기 과제에 대한 집중 지속력 부족",
          "평가나 피드백을 받을 때 순간적 정서 기복 우려",
        ],
      },
      recommendations: {
        learningMethods: [
          "과제를 15~20분 단위의 소규모 덩어리(Chunking)로 분할하여 제시할 것",
          "마인드맵, 그래픽 조직자 등 시각적 정리 도구를 활용하도록 권장",
          "과제 완료 후 즉각적인 소형 보상 및 스스로 스티커 붙이기 스케줄러 적용",
        ],
        selfManagement: [
          "하루 일과 중 '나만의 정돈 및 집중 10분시간'을 루틴화하도록 지도",
          "감정이 격해졌을 때 사용할 수 있는 '3초 멈춤 호흡법' 습관화",
        ],
        teacherAdvice: [
          "공개적인 지적보다는 일대일의 온화하고 구체적인 조언이 학습 동기 유지에 유리합니다.",
          "모둠 활동 시 발표자나 아이디어 정리자 역할을 부여하여 책임감을 자극해 주세요.",
          "결과보다는 노력한 과정과 구체적인 시도 행위를 언급해 격려해 주는 것이 정서 안정에 도움이 됩니다.",
        ],
      },
    },
  },
];

export const GAS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script (GAS) 코드
 * 심리검사 결과 데이터를 구글 시트에 자동으로 기록하는 웹앱 스크립트입니다.
 * 
 * [설치 방법]
 * 1. 구글 시트 생성 -> 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 아래 코드를 그대로 붙여넣기 합니다.
 * 3. 우측 상단 [배포] -> [새 배포] 클릭
 * 4. 유형 선택: [웹 앱]
 * 5. 설명: 심리검사 분석기 저장 API
 * 6. 다음 사용자로 실행: [나 (내 계정)]
 * 7. 액세스 권한이 있는 사용자: [모든 사용자 (Anyone)] -> 반드시 확인!
 * 8. [배포] 버튼 클릭 후 생성된 웹 앱 URL (https://script.google.com/macros/s/...)을 복사하여 본 앱에 입력하세요.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 헤더가 없는 경우 첫 번째 줄에 헤더 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "전송 일시",
        "소속 (학년/반)",
        "학생 이름",
        "생년월일",
        "종합 프로파일 요약",
        "강점 요약",
        "약점 요약",
        "추천 학습 및 지도법"
      ]);
      // 헤더 스타일 적용
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setBackground("#4F46E5");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
    }
    
    var contents = JSON.parse(e.postData.contents);
    var now = new Date();
    var formattedDate = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    var affiliation = contents.affiliation || "";
    var studentName = contents.studentName || "";
    var birthDate = contents.birthDate || "";
    
    // 프로파일 텍스트 변환
    var profileText = "";
    if (typeof contents.profile === 'object') {
      profileText = contents.profile.overallProfile || JSON.stringify(contents.profile);
    } else {
      profileText = contents.profile || "";
    }
    
    // 강점/약점 텍스트 변환
    var strengthsText = "";
    var weaknessesText = "";
    if (typeof contents.strengthsWeaknesses === 'object') {
      strengthsText = (contents.strengthsWeaknesses.strengths || []).join(" / ");
      weaknessesText = (contents.strengthsWeaknesses.weaknesses || []).join(" / ");
    } else {
      strengthsText = contents.strengthsWeaknesses || "";
    }
    
    // 추천사항 텍스트 변환
    var recText = "";
    if (typeof contents.recommendations === 'object') {
      var lm = (contents.recommendations.learningMethods || []).join(" / ");
      var ta = (contents.recommendations.teacherAdvice || []).join(" / ");
      recText = "학습: " + lm + " | 교사조언: " + ta;
    } else {
      recText = contents.recommendations || "";
    }
    
    // 시트에 데이터 행 추가
    sheet.appendRow([
      formattedDate,
      affiliation,
      studentName,
      birthDate,
      profileText,
      strengthsText,
      weaknessesText,
      recText
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "성공적으로 저장되었습니다."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("GAS Web App은 정상 작동 중입니다.");
}
`;
