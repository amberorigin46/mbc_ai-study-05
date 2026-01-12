
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: number;
  subscriberCount: number;
  performanceRatio: number; // 조회수 / 구독자수
}

export interface ContentIdea {
  title: string;
  angle: string;
  reasoning: string;
  targetAudience: string;
}

export interface AnalysisResult {
  summary: string;
  pros: string[];
  cons: string[];
  keywords: string[]; // 추천 키워드 5개
  ideas: ContentIdea[];
}

export interface ScriptOutline {
  keyword: string;
  title: string;
  intro: string;
  sections: {
    heading: string;
    content: string;
  }[];
  outro: string;
}
