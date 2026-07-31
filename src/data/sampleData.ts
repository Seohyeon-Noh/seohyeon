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
          "새로운 개념에 대한 이해 속도가 빠르고 시각적/체험적 자료를 활용한 학습에 매우 효과적입니다.\n\n💡 일상생활 예시: 좋아하는 로봇 모형 조립이나 유튜브 탐구 영상을 볼 때는 집중력이 대단하지만, 설명글로만 가득 찬 길고 복잡한 학습지를 풀 때는 쉽게 흥미를 잃고 딴청을 피우는 모습으로 나타납니다.",
        emotionalTrait:
          "기본적으로 밝고 긍정적이나, 자신의 실수나 다른 사람의 지적을 받을 때 마음속 불안이 커질 수 있습니다.\n\n💡 일상생활 예시: 발표 중 잘못 말했거나 시험 점수가 기대만큼 안 나왔을 때, 화를 내거나 말을 안 하고 입을 다물어버리는 행동으로 자신을 보호하려 합니다.",
        socialTrait:
          "또래 집단에서 활발하게 아이디어를 제안하며 친구들과 나누는 것을 즐깁니다.\n\n💡 일상생활 예시: 쉬는 시간에 친구들과 모여 게임 규칙을 정하거나 모둠 과제 주제를 결정할 때 먼저 멋진 아이디어를 던지며 분위기를 이끄는 리더십을 보여줍니다.",
        overallProfile:
          "민준이는 자존감과 친구 관계가 아주 뛰어난 원기 왕성한 학생입니다! 🎮 친구들과 놀거나 새로운 체험 활동을 할 때는 빛을 발하지만, 📖 반복적인 문제 풀이나 지루한 과제를 할 때 집중력이 쉽게 떨어질 수 있어요. 지적을 받으면 마음 상해하기 쉬우니 칭찬과 작은 과제 나누기로 성취감을 키워주는 것이 핵심입니다.",
      },
      strengthsWeaknesses: {
        strengths: [
          "풍부한 호기심과 창의적 아이디어 (예: 모둠 과제나 퀴즈 게임 시 흥미로운 아이디어 제안)",
          "또래 친구들과의 적극적 소통 (예: 쉬는 시간에 친구들의 이야기를 잘 듣고 잘 어울림)",
          "새로운 활동에 적극 참여하려는 태도 (예: 새로운 과학 실험이나 체육 활동에 제일 먼저 손들기)",
          "시각적 자료 활용 시 높은 이해력 (예: 그림, 영상, 마인드맵 자료를 볼 때 빠르게 파악)",
        ],
        weaknesses: [
          "반복적 과제 시 쉽게 산만해짐 (예: 문제집을 연속 20분 이상 풀 때 연필을 만지작거림)",
          "긴 호흡의 장기 과제 집중 부족 (예: 방학 숙제나 일주일 단위 프로젝트 제출 시 미루기)",
          "평가/지적 시 순간적 정서 기복 (예: 선생님이나 부모님의 지적에 기분이 뚝 떨어지고 시무룩해짐)",
        ],
      },
      recommendations: {
        learningMethods: [
          "#소규모_분할학습 20분 공부 후 5분 쉬는 **소규모 덩어리 학습법(Chunking)**을 적용해 집중력을 유지시켜 주세요.",
          "#시각적_도구활용 **마인드맵, 개념 다이어그램, 색깔 펜** 등 시각적 정리 도구를 활용해 정리하도록 돕습니다.",
          "#즉각적_보상체계 문제집 1페이징 완성 시 **스티커 붙이기 및 소형 보상**으로 성취감을 극대화합니다.",
        ],
        selfManagement: [
          "#10분_정돈루틴 하루 일과 중 스스로 **책상 정돈 및 다음 날 준비물 챙기기 10분 타이머**를 실행합니다.",
          "#3초_숨고르기 답답하거나 감정이 격해질 때 **3초간 깊게 숨을 내쉬는 3초 호흡법**을 연습합니다.",
        ],
        teacherAdvice: [
          "#개별_온화한_조언 공개적인 지적보다는 **일대일 조용한 공간에서 구체적인 개선점**을 이야기해 주세요.",
          "#모둠역할_부여 모둠 활동 시 **발표자 또는 리더 역할**을 부여하여 책임감과 흥미를 자극해 주세요.",
          "#과정중심_격려 결과(점수)보다는 **노력한 과정과 시도한 구체적 모습**을 언급하며 칭찬해 주세요.",
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
