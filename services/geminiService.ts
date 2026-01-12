
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScriptOutline } from "../types";

export const analyzeContent = async (
  apiKey: string,
  videoTitle: string,
  description: string,
  comments: string[]
): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("Gemini API 키를 입력해주세요.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const commentText = comments.length > 0 
    ? comments.join('\n---\n') 
    : "시청자 댓글이 없습니다. 영상 제목과 설명만으로 분석해주세요.";

  const prompt = `
    당신은 유튜브 분석 전문가입니다. 아래 영상 데이터와 댓글을 분석하세요.
    제목: ${videoTitle}
    댓글 요약: ${commentText.substring(0, 3000)}

    다음 JSON 형식으로 응답하세요:
    1. summary: 전체적인 반응 요약 (한 문장)
    2. pros: 흥행 포인트 3개 (배열)
    3. cons: 아쉬운 점 또는 추가 질문 3개 (배열)
    4. keywords: 시청자들이 열광하거나 자주 언급한 '다음 영상 주제용 핵심 키워드' 5개 (배열)
    5. ideas: 추천 콘텐츠 기획안 3개
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          ideas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                angle: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                targetAudience: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "pros", "cons", "keywords", "ideas"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateScriptOutline = async (apiKey: string, keyword: string, originalContext: string): Promise<ScriptOutline> => {
  if (!apiKey) throw new Error("Gemini API 키를 입력해주세요.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    선택된 키워드: "${keyword}"
    참고 문맥: ${originalContext}

    위 키워드를 주제로 유튜브 영상 대본 목차를 작성해주세요. 시청자의 흥미를 끌 수 있는 구성을 제안하세요.
    다음 JSON 형식으로 응답하세요:
    - keyword: "${keyword}"
    - title: 자극적이고 클릭하고 싶은 제목
    - intro: 오프닝 멘트 및 후킹 포인트
    - sections: 주요 내용 목차 (heading, content 속성을 가진 객체 배열 3~5개)
    - outro: 마무리 및 구독 유도 멘트
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING },
          title: { type: Type.STRING },
          intro: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          },
          outro: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
